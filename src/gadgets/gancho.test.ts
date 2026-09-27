import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ALCANCE, elegirAnclaje, hayLineaDeVista, puntoDeLlegada, segmentoCruzaCaja } from './gancho';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const caja = (min: THREE.Vector3, max: THREE.Vector3) => new THREE.Box3(min, max);
const adelanteZ = v(0, 0, -1);

describe('segmentoCruzaCaja', () => {
  const c = caja(v(-1, -1, -1), v(1, 1, 1));
  it('detecta un segmento que atraviesa la caja', () => {
    expect(segmentoCruzaCaja(v(-5, 0, 0), v(5, 0, 0), c)).toBe(true);
  });
  it('ignora un segmento que pasa por al lado', () => {
    expect(segmentoCruzaCaja(v(-5, 3, 0), v(5, 3, 0), c)).toBe(false);
  });
  it('ignora un segmento que termina antes de la caja', () => {
    expect(segmentoCruzaCaja(v(-5, 0, 0), v(-2, 0, 0), c)).toBe(false);
  });
});

describe('hayLineaDeVista', () => {
  const anclaje = v(0, 12.4, -10);
  const poste = caja(v(-0.125, 10, -10.125), v(0.125, 12, -9.875));
  it('no cuenta el poste propio del anclaje como obstáculo', () => {
    expect(hayLineaDeVista(v(0, 12, 0), anclaje, [poste])).toBe(true);
  });
  it('un muro en medio tapa la vista', () => {
    const muro = caja(v(-3, 0, -6), v(3, 20, -5));
    expect(hayLineaDeVista(v(0, 12, 0), anclaje, [poste, muro])).toBe(false);
  });
});

describe('elegirAnclaje', () => {
  const pies = v(0, 8, 0);
  it('elige el anclaje que está delante', () => {
    const delante = v(0, 10, -10);
    const detras = v(0, 10, 8);
    expect(elegirAnclaje(pies, adelanteZ, [detras, delante], [])).toBe(delante);
  });
  it('prefiere el más centrado en la vista', () => {
    const centrado = v(0, 10, -20);
    const alCostado = v(8, 10, -10);
    expect(elegirAnclaje(pies, adelanteZ, [alCostado, centrado], [])).toBe(centrado);
  });
  it('no elige anclajes fuera de alcance', () => {
    expect(elegirAnclaje(pies, adelanteZ, [v(0, 10, -(ALCANCE + 5))], [])).toBeNull();
  });
  it('no elige anclajes tapados', () => {
    const muro = caja(v(-3, 0, -6), v(3, 30, -5));
    expect(elegirAnclaje(pies, adelanteZ, [v(0, 10, -10)], [muro])).toBeNull();
  });
});

describe('puntoDeLlegada', () => {
  it('queda sobre la azotea, al lado del poste y del lado de Carmen', () => {
    const llegada = puntoDeLlegada(v(0, 8, 0), v(0, 12.4, -10));
    expect(llegada.y).toBeCloseTo(10);
    expect(llegada.z).toBeCloseTo(-8.8);
    expect(llegada.x).toBeCloseTo(0);
  });
});
