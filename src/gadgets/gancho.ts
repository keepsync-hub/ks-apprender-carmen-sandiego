import * as THREE from 'three';

// Gancho de muñeca de Carmen. Pensado para niñas y niños: apunta solo al anclaje
// visible más cómodo frente a la cámara y, al usarlo, tira de Carmen hasta la
// azotea de ese anclaje ("tirón"). Sin apuntar con precisión ni balanceos difíciles.

export const ALCANCE = 30;
const VELOCIDAD_TIRON = 26;
const TIEMPO_DISPARO = 0.12;
const TIEMPO_MAXIMO = 2.5;
/** El anclaje está sobre un poste; Carmen aterriza al lado de la base del poste. */
const ALTURA_ANCLAJE_SOBRE_AZOTEA = 2.4;
const SEPARACION_POSTE = 1.2;
const ALTURA_PECHO = 2.4;

/** Cruce de segmento contra caja (método de las franjas). */
export function segmentoCruzaCaja(a: THREE.Vector3, b: THREE.Vector3, caja: THREE.Box3): boolean {
  let tMin = 0;
  let tMax = 1;
  for (const eje of ['x', 'y', 'z'] as const) {
    const d = b[eje] - a[eje];
    if (Math.abs(d) < 1e-9) {
      if (a[eje] <= caja.min[eje] || a[eje] >= caja.max[eje]) return false;
      continue;
    }
    let t1 = (caja.min[eje] - a[eje]) / d;
    let t2 = (caja.max[eje] - a[eje]) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin >= tMax) return false;
  }
  return true;
}

const debajo = new THREE.Vector3();

/** true si nada tapa la línea entre el pecho de Carmen y el anclaje. */
export function hayLineaDeVista(
  desde: THREE.Vector3,
  anclaje: THREE.Vector3,
  solidos: readonly THREE.Box3[],
): boolean {
  // Se ignora el poste que sostiene al anclaje: la caja que contiene el punto justo debajo.
  debajo.set(anclaje.x, anclaje.y - 0.5, anclaje.z);
  return !solidos.some((caja) => !caja.containsPoint(debajo) && segmentoCruzaCaja(desde, anclaje, caja));
}

const pecho = new THREE.Vector3();
const hacia = new THREE.Vector3();

/**
 * Elige el anclaje más cómodo: dentro del alcance, delante de la cámara y visible.
 * Se prefiere el que está más al centro de la vista y, a igualdad, el más cercano.
 */
export function elegirAnclaje(
  pies: THREE.Vector3,
  adelante: THREE.Vector3,
  anclajes: readonly THREE.Vector3[],
  solidos: readonly THREE.Box3[],
): THREE.Vector3 | null {
  pecho.set(pies.x, pies.y + ALTURA_PECHO, pies.z);
  let mejor: THREE.Vector3 | null = null;
  let mejorPuntaje = -Infinity;
  for (const anclaje of anclajes) {
    hacia.subVectors(anclaje, pecho);
    const distancia = hacia.length();
    if (distancia > ALCANCE || distancia < 2) continue;
    // Solo la dirección horizontal importa para "delante de la cámara".
    const horizontal = Math.hypot(hacia.x, hacia.z);
    if (horizontal < 0.5) continue;
    const alineacion = (hacia.x * adelante.x + hacia.z * adelante.z) / horizontal;
    if (alineacion < 0.5) continue; // fuera de un cono de ~60° a cada lado
    const puntaje = alineacion * 2 - distancia / ALCANCE;
    if (puntaje <= mejorPuntaje) continue;
    if (!hayLineaDeVista(pecho, anclaje, solidos)) continue;
    mejor = anclaje;
    mejorPuntaje = puntaje;
  }
  return mejor;
}

/** Punto de llegada: sobre la azotea, al lado del poste, del lado de Carmen. */
export function puntoDeLlegada(pies: THREE.Vector3, anclaje: THREE.Vector3): THREE.Vector3 {
  const llegada = new THREE.Vector3(anclaje.x, anclaje.y - ALTURA_ANCLAJE_SOBRE_AZOTEA, anclaje.z);
  const lado = new THREE.Vector3(pies.x - anclaje.x, 0, pies.z - anclaje.z);
  if (lado.lengthSq() < 1e-6) lado.set(1, 0, 0);
  llegada.addScaledVector(lado.normalize(), SEPARACION_POSTE);
  return llegada;
}

export interface Gancho {
  /** Anclaje elegido en este momento (para resaltarlo), o null. */
  objetivo: THREE.Vector3 | null;
  /** true mientras el gancho controla el movimiento de Carmen. */
  activo: boolean;
  /**
   * Llamar cada cuadro antes de mover a Carmen. Si devuelve true, el gancho ya
   * fijó `vel` y el controlador no debe aplicar caminar, salto ni gravedad.
   */
  actualizar(
    dt: number,
    pies: THREE.Vector3,
    vel: THREE.Vector3,
    adelante: THREE.Vector3,
    pidio: boolean,
  ): boolean;
  /** Suelta el gancho (por ejemplo, al reaparecer en la azotea). */
  soltar(): void;
  /** Se llama al disparar el gancho. */
  alDisparar: (() => void) | null;
}

export function crearGancho(
  escena: THREE.Scene,
  anclajes: readonly THREE.Vector3[],
  solidos: readonly THREE.Box3[],
): Gancho {
  // Aro amarillo que marca el anclaje elegido.
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.12, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffd23f }),
  );
  aro.visible = false;
  escena.add(aro);

  // Cable del gancho: una caja delgada que se estira entre la mano y el anclaje
  // (una línea de 1 px casi no se ve).
  const geoCable = new THREE.BoxGeometry(0.1, 0.1, 1);
  geoCable.translate(0, 0, 0.5); // el origen queda en la punta de la mano
  const cable = new THREE.Mesh(geoCable, new THREE.MeshBasicMaterial({ color: 0x111111 }));
  cable.visible = false;
  escena.add(cable);
  const mano = new THREE.Vector3();
  const punta = new THREE.Vector3();

  let anclado: THREE.Vector3 | null = null;
  let llegada = new THREE.Vector3();
  let tiempo = 0;
  let quieto = 0;
  const anterior = new THREE.Vector3();
  const direccion = new THREE.Vector3();

  const gancho: Gancho = {
    objetivo: null,
    activo: false,
    alDisparar: null,
    soltar() {
      anclado = null;
      gancho.activo = false;
      cable.visible = false;
    },
    actualizar(dt, pies, vel, adelante, pidio) {
      if (!anclado) {
        gancho.objetivo = elegirAnclaje(pies, adelante, anclajes, solidos);
        if (pidio && gancho.objetivo) {
          anclado = gancho.objetivo;
          llegada = puntoDeLlegada(pies, anclado);
          tiempo = 0;
          quieto = 0;
          gancho.activo = true;
          gancho.alDisparar?.();
        }
      }

      aro.visible = !anclado && gancho.objetivo !== null;
      if (aro.visible && gancho.objetivo) {
        aro.position.copy(gancho.objetivo);
        aro.rotation.y += dt * 3;
      }

      if (!anclado) return false;

      tiempo += dt;
      const extension = Math.min(1, tiempo / TIEMPO_DISPARO);
      mano.set(pies.x, pies.y + ALTURA_PECHO + 0.8, pies.z);
      punta.lerpVectors(mano, anclado, extension);
      cable.position.copy(mano);
      cable.lookAt(punta);
      cable.scale.set(1, 1, Math.max(0.01, mano.distanceTo(punta)));
      cable.visible = true;

      // Primero el cable vuela hasta el anclaje; Carmen queda suspendida.
      if (extension < 1) {
        vel.set(0, 0, 0);
        anterior.copy(pies);
        return true;
      }

      // Si queda trabada contra algo o tarda demasiado, se suelta sin problema.
      quieto = pies.distanceTo(anterior) < VELOCIDAD_TIRON * dt * 0.1 ? quieto + dt : 0;
      anterior.copy(pies);

      // Apuntamos un poco por encima de la llegada para pasar el borde de la azotea.
      direccion.set(llegada.x - pies.x, llegada.y + 0.6 - pies.y, llegada.z - pies.z);
      const distancia = direccion.length();
      if (distancia < 0.8 || quieto > 0.25 || tiempo > TIEMPO_MAXIMO) {
        vel.set(0, 5, 0); // pequeño saltito al llegar
        gancho.soltar();
        return true;
      }
      vel.copy(direccion.multiplyScalar(Math.min(VELOCIDAD_TIRON, distancia / dt) / distancia));
      return true;
    },
  };
  return gancho;
}
