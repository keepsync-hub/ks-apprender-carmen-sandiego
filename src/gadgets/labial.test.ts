import { describe, expect, it } from 'vitest';
import { BOTONES, Hackeo, largoSegunNivel } from './labial';

describe('Hackeo', () => {
  it('genera una secuencia del largo pedido y sin botones repetidos seguidos', () => {
    let s = 0;
    const siempreIgual = () => (s++, 0); // pediría el mismo botón siempre
    const h = new Hackeo(6, siempreIgual);
    expect(h.secuencia).toHaveLength(6);
    for (let i = 1; i < 6; i++) expect(h.secuencia[i]).not.toBe(h.secuencia[i - 1]);
    for (const b of h.secuencia) expect(b).toBeLessThan(BOTONES.length);
  });

  it('repetir la secuencia completa termina el hackeo', () => {
    const h = new Hackeo(4);
    const resultados = h.secuencia.map((b) => h.tocar(b));
    expect(resultados).toEqual(['bien', 'bien', 'bien', 'completo']);
    expect(h.completo).toBe(true);
  });

  it('un error reinicia el intento sin terminar el juego', () => {
    const h = new Hackeo(3);
    h.tocar(h.secuencia[0]);
    const equivocado = (h.secuencia[1] + 1) % BOTONES.length;
    expect(h.tocar(equivocado)).toBe('error');
    expect(h.aciertos).toBe(0);
    expect(h.errores).toBe(1);
    expect(h.secuencia.map((b) => h.tocar(b)).at(-1)).toBe('completo');
  });

  it('Aprendiz usa 3 pasos y Detective 4', () => {
    expect(largoSegunNivel('aprendiz')).toBe(3);
    expect(largoSegunNivel('detective')).toBe(4);
  });
});
