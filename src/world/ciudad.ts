import * as THREE from 'three';
import type { TemaCiudad } from '../data/tipos';

// Barrio de azoteas de bloques. Cada ciudad del caso cambia el cielo, los colores
// y agrega su hito (puente, pirámide u obelisco) hecho de cajas.

/** Generador pseudoaleatorio con semilla: una ciudad siempre sale igual. */
function azar(semilla: number): () => number {
  let s = semilla % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Convierte un texto (el id de la ciudad) en una semilla numérica. */
export function semillaDe(texto: string): number {
  let h = 1985;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) % 2147483647;
  return h;
}

export interface Azotea {
  /** Centro del techo (donde está el poste del anclaje). */
  centro: THREE.Vector3;
  anclaje: THREE.Vector3;
}

export interface Ciudad {
  grupo: THREE.Group;
  /** Puntos rojos donde se puede enganchar el gancho de Carmen. */
  anclajes: THREE.Vector3[];
  /** Cajas contra las que choca Carmen (suelo, edificios, postes, hito). */
  solidos: THREE.Box3[];
  /** Azoteas con anclaje, ordenadas de la más cercana a la más lejana del inicio. */
  azoteas: Azotea[];
  /** Punto de partida de Carmen: el centro de una azotea. */
  inicio: THREE.Vector3;
  animar(tiempo: number): void;
  liberar(): void;
}

const TEMA_ENTRENAMIENTO: TemaCiudad = {
  cielo: 0xff9e6b,
  edificios: [0xf2c14e, 0x5b8e7d, 0xf78154, 0x4d9de0, 0xe15554, 0x7768ae, 0x3bb273],
  hito: 'ninguno',
};

export function crearCiudad(tema: TemaCiudad = TEMA_ENTRENAMIENTO, semilla = 1985): Ciudad {
  const grupo = new THREE.Group();
  const anclajes: THREE.Vector3[] = [];
  const mallasAnclaje: THREE.Mesh[] = [];
  const solidos: THREE.Box3[] = [];
  const azoteas: Azotea[] = [];
  const agregar = (malla: THREE.Mesh) => {
    malla.castShadow = true;
    malla.receiveShadow = true;
    grupo.add(malla);
    malla.updateMatrixWorld();
    solidos.push(new THREE.Box3().setFromObject(malla));
  };
  const bloque: Bloque = (ancho, alto, fondo, color, x, y, z) => {
    const malla = new THREE.Mesh(
      new THREE.BoxGeometry(ancho, alto, fondo),
      new THREE.MeshLambertMaterial({ color }),
    );
    malla.position.set(x, y, z);
    agregar(malla);
    return malla;
  };
  const r = azar(semilla);

  bloque(200, 1, 200, 0x3a3a46, 0, -0.5, 0);

  const materialVentana = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
  const geoAnclaje = new THREE.OctahedronGeometry(0.4);
  const matAnclaje = new THREE.MeshBasicMaterial({ color: 0xff2d3a });
  const matPoste = new THREE.MeshLambertMaterial({ color: 0x222222 });

  const alturaInicio = 8;
  const inicio = new THREE.Vector3(8, alturaInicio, 8);

  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      // Calles cada tres manzanas.
      if (x % 3 === 0 || z % 3 === 0) continue;
      const esInicio = x === 1 && z === 1;
      const alto = esInicio ? alturaInicio : 4 + Math.floor(r() * 14);
      const ancho = 5 + r() * 2;
      const color = tema.edificios[Math.floor(r() * tema.edificios.length)];
      bloque(ancho, alto, ancho, color, x * 8, alto / 2, z * 8);

      // Ventanas como pequeños bloques luminosos en la fachada frontal.
      for (let piso = 2; piso < alto - 1; piso += 2.5) {
        for (const dx of [-ancho / 4, ancho / 4]) {
          if (r() < 0.35) continue;
          const ventana = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.1), materialVentana);
          ventana.position.set(x * 8 + dx, piso, z * 8 + ancho / 2 + 0.05);
          grupo.add(ventana);
        }
      }

      // Muchas azoteas tienen un poste con punto de anclaje para el gancho, así
      // siempre hay a dónde ir. Los edificios junto al inicio siempre tienen uno.
      const juntoAlInicio = Math.abs(x - 1) + Math.abs(z - 1) === 1;
      if (!esInicio && (juntoAlInicio || r() < 0.55)) {
        const poste = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2, 0.25), matPoste);
        poste.position.set(x * 8, alto + 1, z * 8);
        agregar(poste);
        const anclaje = new THREE.Mesh(geoAnclaje, matAnclaje);
        anclaje.position.set(x * 8, alto + 2.4, z * 8);
        grupo.add(anclaje);
        anclajes.push(anclaje.position);
        mallasAnclaje.push(anclaje);
        azoteas.push({ centro: new THREE.Vector3(x * 8, alto, z * 8), anclaje: anclaje.position });
      }
    }
  }

  construirHito(tema.hito, bloque);
  azoteas.sort((a, b) => a.centro.distanceTo(inicio) - b.centro.distanceTo(inicio));

  return {
    grupo,
    anclajes,
    solidos,
    azoteas,
    inicio,
    animar(tiempo) {
      for (const [i, a] of mallasAnclaje.entries()) {
        a.rotation.y = tiempo * 2 + i;
        a.scale.setScalar(1 + Math.sin(tiempo * 4 + i) * 0.15);
      }
    },
    liberar() {
      grupo.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
    },
  };
}

type Bloque = (
  ancho: number,
  alto: number,
  fondo: number,
  color: number,
  x: number,
  y: number,
  z: number,
) => THREE.Mesh;

/** Hitos en las calles del borde (x = -24), donde no hay edificios. */
function construirHito(hito: TemaCiudad['hito'], bloque: Bloque): void {
  if (hito === 'puente') {
    // Puente rojo al estilo Golden Gate: dos torres y un tablero por el que se puede caminar.
    const rojo = 0xc0362c;
    for (const z of [-10, 10]) {
      bloque(0.8, 26, 0.8, rojo, -25.5, 13, z);
      bloque(0.8, 26, 0.8, rojo, -22.5, 13, z);
      for (const y of [16, 22, 25.5]) bloque(3.8, 0.8, 0.8, rojo, -24, y, z);
    }
    bloque(4, 0.6, 34, rojo, -24, 12, 0);
  } else if (hito === 'piramide') {
    // Pirámide escalonada: cada escalón se puede subir saltando.
    const tonos = [0xb08a5a, 0xa27d4f, 0x957146, 0x88663d, 0x7b5b35];
    tonos.forEach((color, i) => {
      const lado = 8 - i * 1.6;
      bloque(lado, 1.6, lado, color, -24, 0.8 + i * 1.6, -24);
    });
  } else if (hito === 'obelisco') {
    const blanco = 0xf2f2f2;
    bloque(2, 26, 2, blanco, -24, 13, -24);
    bloque(1.4, 1.4, 1.4, blanco, -24, 26.7, -24);
    bloque(0.7, 0.9, 0.7, blanco, -24, 27.8, -24);
  }
}
