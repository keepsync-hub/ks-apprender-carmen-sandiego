import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CUERPO, moverConColisiones } from './fisica';

const suelo = new THREE.Box3(new THREE.Vector3(-50, -1, -50), new THREE.Vector3(50, 0, 50));
const muro = new THREE.Box3(new THREE.Vector3(2, 0, -5), new THREE.Vector3(4, 10, 5));

describe('moverConColisiones', () => {
  it('aterriza sobre el suelo y marca enSuelo', () => {
    const pos = new THREE.Vector3(0, 0.5, 0);
    const vel = new THREE.Vector3(0, -10, 0);
    const r = moverConColisiones(pos, vel, 0.1, [suelo]);
    expect(pos.y).toBe(0);
    expect(vel.y).toBe(0);
    expect(r.enSuelo).toBe(true);
  });

  it('se detiene contra un muro sin atravesarlo', () => {
    const pos = new THREE.Vector3(1, 0, 0);
    const vel = new THREE.Vector3(20, 0, 0);
    moverConColisiones(pos, vel, 0.1, [suelo, muro]);
    expect(pos.x).toBeCloseTo(2 - CUERPO.radio);
    expect(vel.x).toBe(0);
  });

  it('se desliza por el muro en el otro eje', () => {
    const pos = new THREE.Vector3(1.6, 0, 0);
    const vel = new THREE.Vector3(5, 0, 5);
    moverConColisiones(pos, vel, 0.1, [suelo, muro]);
    expect(pos.z).toBeCloseTo(0.5);
  });

  it('choca la cabeza contra un techo', () => {
    const techo = new THREE.Box3(new THREE.Vector3(-5, 5, -5), new THREE.Vector3(5, 6, 5));
    const pos = new THREE.Vector3(0, 1, 0);
    const vel = new THREE.Vector3(0, 10, 0);
    moverConColisiones(pos, vel, 0.1, [techo]);
    expect(pos.y).toBeCloseTo(5 - CUERPO.alto);
    expect(vel.y).toBe(0);
  });

  it('puede caminar pegada a una pared sin quedar atrapada', () => {
    const pos = new THREE.Vector3(2 - CUERPO.radio, 0, 0);
    const vel = new THREE.Vector3(0, 0, 3);
    moverConColisiones(pos, vel, 0.1, [suelo, muro]);
    expect(pos.z).toBeCloseTo(0.3);
  });
});
