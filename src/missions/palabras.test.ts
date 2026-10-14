import { describe, expect, it } from 'vitest';
import { PALABRAS } from '../data/palabras';
import { cantidadOpciones, elegirPalabra, opcionesPara, registrarRespuesta } from './palabras';

describe('palabras', () => {
  it('no repite ids ni significados, y ninguna pista dice la respuesta', () => {
    expect(new Set(PALABRAS.map((p) => p.id)).size).toBe(PALABRAS.length);
    expect(new Set(PALABRAS.map((p) => p.es)).size).toBe(PALABRAS.length);
    for (const p of PALABRAS) expect(p.pista.toLowerCase()).not.toContain(p.es);
  });

  it('enseña primero las palabras nuevas, en orden', () => {
    expect(elegirPalabra({}).id).toBe(PALABRAS[0].id);
    expect(elegirPalabra({ [PALABRAS[0].id]: 1 }).id).toBe(PALABRAS[1].id);
  });

  it('no repite una palabra ya usada en el caso', () => {
    expect(elegirPalabra({}, [PALABRAS[0].id]).id).toBe(PALABRAS[1].id);
  });

  it('con todo aprendido, repasa la de menor dominio', () => {
    const vocabulario = Object.fromEntries(PALABRAS.map((p) => [p.id, 3]));
    vocabulario[PALABRAS[5].id] = 1;
    expect(elegirPalabra(vocabulario).id).toBe(PALABRAS[5].id);
  });

  it('ofrece la respuesta correcta y señuelos distintos', () => {
    for (const nivel of ['aprendiz', 'detective'] as const) {
      const cantidad = cantidadOpciones(nivel);
      const opciones = opcionesPara(PALABRAS[3], cantidad);
      expect(opciones).toHaveLength(cantidad);
      expect(opciones).toContain(PALABRAS[3]);
      expect(new Set(opciones.map((o) => o.es)).size).toBe(cantidad);
    }
  });

  it('sube el dominio al acertar al primer intento y lo baja al fallar', () => {
    let v = registrarRespuesta({}, 'cat', false);
    expect(v.cat).toBe(1);
    v = registrarRespuesta(v, 'cat', true);
    v = registrarRespuesta(v, 'cat', true);
    v = registrarRespuesta(v, 'cat', true);
    expect(v.cat).toBe(3);
    v = registrarRespuesta(v, 'cat', false);
    expect(v.cat).toBe(2);
  });
});
