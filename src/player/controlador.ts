import * as THREE from 'three';
import type { Entrada } from '../core/entrada';
import type { Gancho } from '../gadgets/gancho';
import { moverConColisiones } from '../world/fisica';
import type { Carmen } from './carmen';

// Controlador en tercera persona al estilo Roblox: la cámara sigue a Carmen desde
// atrás y "adelante" siempre es hacia donde mira la cámara.

const VELOCIDAD = 8;
const IMPULSO_SALTO = 12.5;
const GRAVEDAD = 32;
const DISTANCIA_CAMARA = 10;
const ALTURA_CAMARA = 5;
/** Tiempo extra para saltar justo después de salir de un borde (más amable). */
const TOLERANCIA_SALTO = 0.12;

export interface Controlador {
  posicion: THREE.Vector3;
  actualizar(dt: number, tiempo: number): void;
  /** Se llama cuando Carmen cae a la calle y vuelve a la última azotea. */
  alCaer: (() => void) | null;
  alSaltar: (() => void) | null;
}

export function crearControlador(
  carmen: Carmen,
  camara: THREE.PerspectiveCamera,
  entrada: Entrada,
  gancho: Gancho,
  solidos: readonly THREE.Box3[],
  inicio: THREE.Vector3,
): Controlador {
  const posicion = inicio.clone();
  const velocidad = new THREE.Vector3();
  const ultimaAzotea = inicio.clone();
  let anguloCamara = Math.PI / 4;
  let tiempoEnAire = 0;
  const focoCamara = new THREE.Vector3();

  const adelante = new THREE.Vector3();
  const derecha = new THREE.Vector3();
  const deseado = new THREE.Vector3();

  // Al empezar, Carmen mira hacia adelante (de espaldas a la cámara).
  carmen.modelo.rotation.y = Math.atan2(-Math.sin(anguloCamara), -Math.cos(anguloCamara));

  const controlador: Controlador = {
    posicion,
    alCaer: null,
    alSaltar: null,
    actualizar(dt, tiempo) {
      dt = Math.min(dt, 1 / 30); // evita atravesar paredes si el cuadro se atrasa

      anguloCamara += entrada.girarCamara;
      adelante.set(-Math.sin(anguloCamara), 0, -Math.cos(anguloCamara));
      derecha.set(-adelante.z, 0, adelante.x);

      const { x, y } = entrada.mover;
      deseado.copy(adelante).multiplyScalar(y).addScaledVector(derecha, x);

      // Mientras el gancho tira, él decide la velocidad (sin caminar ni gravedad).
      const tirando = gancho.actualizar(dt, posicion, velocidad, adelante, entrada.gancho);
      if (!tirando) {
        velocidad.x = deseado.x * VELOCIDAD;
        velocidad.z = deseado.z * VELOCIDAD;
        if (entrada.saltar && tiempoEnAire < TOLERANCIA_SALTO) {
          velocidad.y = IMPULSO_SALTO;
          tiempoEnAire = TOLERANCIA_SALTO;
          controlador.alSaltar?.();
        }
        velocidad.y -= GRAVEDAD * dt;
      }

      const { enSuelo } = moverConColisiones(posicion, velocidad, dt, solidos);
      tiempoEnAire = enSuelo ? 0 : tiempoEnAire + dt;

      if (enSuelo) {
        if (posicion.y > 1) {
          ultimaAzotea.copy(posicion);
        } else {
          // Cayó a la calle: sin castigo, vuelve a la última azotea.
          posicion.copy(ultimaAzotea);
          velocidad.set(0, 0, 0);
          gancho.soltar();
          controlador.alCaer?.();
        }
      }

      // Carmen gira suavemente hacia donde camina (o hacia donde la tira el gancho).
      const rapidez = Math.hypot(x, y);
      const volando = gancho.activo && Math.hypot(velocidad.x, velocidad.z) > 0.1;
      if (rapidez > 0.1 || volando) {
        const objetivo = volando
          ? Math.atan2(velocidad.x, velocidad.z)
          : Math.atan2(deseado.x, deseado.z);
        let diferencia = objetivo - carmen.modelo.rotation.y;
        diferencia = Math.atan2(Math.sin(diferencia), Math.cos(diferencia));
        carmen.modelo.rotation.y += diferencia * Math.min(1, dt * 12);
      }
      carmen.modelo.position.copy(posicion);
      carmen.animar(tiempo, enSuelo ? rapidez : 0.3, gancho.activo);

      // Cámara detrás y arriba, siguiendo con suavidad.
      focoCamara.lerp(posicion, focoCamara.lengthSq() === 0 ? 1 : Math.min(1, dt * 8));
      camara.position.set(
        focoCamara.x - adelante.x * DISTANCIA_CAMARA,
        focoCamara.y + ALTURA_CAMARA,
        focoCamara.z - adelante.z * DISTANCIA_CAMARA,
      );
      camara.lookAt(focoCamara.x, focoCamara.y + 2.5, focoCamara.z);
    },
  };
  return controlador;
}
