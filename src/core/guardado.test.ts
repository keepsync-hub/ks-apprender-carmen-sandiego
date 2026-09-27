import { beforeEach, describe, expect, it } from 'vitest';
import { cargarProgreso, guardarProgreso } from './guardado';

const almacen = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => almacen.get(k) ?? null,
    setItem: (k: string, v: string) => void almacen.set(k, v),
  },
});

describe('guardado', () => {
  beforeEach(() => almacen.clear());

  it('sin datos: nivel sin elegir y voz y sonido encendidos', () => {
    const p = cargarProgreso();
    expect(p.dificultad).toBeNull();
    expect(p.ajustes.voz).toBe(true);
    expect(p.ajustes.sonido).toBe(true);
  });

  it('completa los ajustes de un guardado antiguo que no los tenía', () => {
    almacen.set('carmen-progreso-v1', JSON.stringify({ dificultad: 'aprendiz' }));
    const p = cargarProgreso();
    expect(p.dificultad).toBe('aprendiz');
    expect(p.ajustes.voz).toBe(true);
  });

  it('guarda y recupera los ajustes', () => {
    const p = cargarProgreso();
    p.ajustes.voz = false;
    p.dificultad = 'detective';
    guardarProgreso(p);
    expect(cargarProgreso()).toMatchObject({ dificultad: 'detective', ajustes: { voz: false } });
  });

  it('datos dañados no rompen el juego', () => {
    almacen.set('carmen-progreso-v1', '{no es json');
    expect(cargarProgreso().dificultad).toBeNull();
  });
});
