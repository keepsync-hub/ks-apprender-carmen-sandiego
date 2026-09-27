import * as THREE from 'three';

// Física simple para un mundo de bloques: el cuerpo de Carmen es una caja que se
// mueve eje por eje y se detiene al tocar un sólido. Predecible y fácil de ajustar.

export const CUERPO = { radio: 0.4, alto: 3.8 };

export interface ResultadoMovimiento {
  enSuelo: boolean;
}

function solapa(pos: THREE.Vector3, caja: THREE.Box3): boolean {
  // Estricto (< en vez de <=) para no quedar pegada al rozar una pared.
  return (
    pos.x + CUERPO.radio > caja.min.x &&
    pos.x - CUERPO.radio < caja.max.x &&
    pos.z + CUERPO.radio > caja.min.z &&
    pos.z - CUERPO.radio < caja.max.z &&
    pos.y + CUERPO.alto > caja.min.y &&
    pos.y < caja.max.y
  );
}

const EJES = ['x', 'z', 'y'] as const;

/**
 * Mueve `pos` (los pies de Carmen) según `vel` durante `dt` segundos, resolviendo
 * choques contra `solidos`. Modifica `pos` y anula la componente de `vel` que choca.
 */
export function moverConColisiones(
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  dt: number,
  solidos: readonly THREE.Box3[],
): ResultadoMovimiento {
  let enSuelo = false;
  for (const eje of EJES) {
    const paso = vel[eje] * dt;
    if (paso === 0) continue;
    pos[eje] += paso;
    for (const caja of solidos) {
      if (!solapa(pos, caja)) continue;
      if (eje === 'y') {
        if (paso < 0) {
          pos.y = caja.max.y;
          enSuelo = true;
        } else {
          pos.y = caja.min.y - CUERPO.alto;
        }
      } else if (paso > 0) {
        pos[eje] = caja.min[eje] - CUERPO.radio;
      } else {
        pos[eje] = caja.max[eje] + CUERPO.radio;
      }
      vel[eje] = 0;
    }
  }
  return { enSuelo };
}
