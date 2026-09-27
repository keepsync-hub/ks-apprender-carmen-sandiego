import { describe, expect, it } from 'vitest';
import type { Dificultad } from '../core/guardado';
import { CASOS, CASO_GATO_DE_LA_SUERTE } from '../data/casos';
import { CIUDADES } from '../data/ciudades';
import { OPERATIVOS } from '../data/operativos';
import type { Seleccion } from './caso';
import { EstadoCaso, rango } from './caso';

const fijo = () => 0; // barajado predecible

/** Juega el caso completo escuchando a todos y eligiendo bien. */
function jugarPerfecto(nivel: Dificultad): EstadoCaso {
  const estado = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, nivel, fijo);
  while (!estado.enFinal) {
    estado.testigosActuales().forEach((_, i) => estado.hablarCon(i));
    if (estado.debeIdentificarAntesDeViajar) {
      const seleccion: Seleccion = {};
      for (const r of estado.rasgosConocidos()) seleccion[r.categoria] = r.valor;
      expect(estado.identificar(seleccion)).toBe('identificado');
    }
    expect(estado.elegirDestino(estado.destinoCorrecto())).toBe(true);
  }
  return estado;
}

describe('EstadoCaso', () => {
  it.each(['aprendiz', 'detective'] as const)(
    'en %s, las pistas alcanzan para identificar al ladrón y llegar al final',
    (nivel) => {
      const estado = jugarPerfecto(nivel);
      expect(estado.ciudadActual).toBe('buenos-aires');
      expect(estado.estrellas()).toBe(3);
      expect(estado.ciudadesVisitadas).toEqual(['san-francisco', 'ciudad-de-mexico', 'buenos-aires']);
    },
  );

  it('Aprendiz ve 3 testigos por ciudad y 2 destinos; Detective 3 testigos y 3 destinos', () => {
    const a = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'aprendiz', fijo);
    const d = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'detective', fijo);
    expect(a.testigosActuales()).toHaveLength(3);
    expect(d.testigosActuales()).toHaveLength(3);
    expect(a.opcionesDestino()).toHaveLength(2);
    expect(d.opcionesDestino()).toHaveLength(3);
    expect(d.opcionesDestino()).toContain('ciudad-de-mexico');
  });

  it('un destino equivocado no avanza y cuesta una estrella (mínimo 1)', () => {
    const e = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'detective', fijo);
    expect(e.elegirDestino('tokio')).toBe(false);
    expect(e.ciudadActual).toBe('san-francisco');
    expect(e.estrellas()).toBe(2);
    e.elegirDestino('lima');
    e.elegirDestino('tokio');
    expect(e.estrellas()).toBe(1);
  });

  it('las pistas completas se reinician al cambiar de ciudad', () => {
    const e = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'aprendiz', fijo);
    e.testigosActuales().forEach((_, i) => e.hablarCon(i));
    expect(e.pistasCompletas).toBe(true);
    e.elegirDestino('ciudad-de-mexico');
    expect(e.pistasCompletas).toBe(false);
  });

  it('hablar dos veces con el mismo testigo no duplica la pista', () => {
    const e = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'aprendiz', fijo);
    e.hablarCon(0);
    e.hablarCon(0);
    expect(e.pistas).toHaveLength(1);
  });

  it('Crime Net: «trepar» solo deja a dos; con ropa gris queda Le Chèvre', () => {
    const e = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'detective', fijo);
    expect(e.identificar({ pasatiempo: 'trepar' })).toBe('varios');
    expect(e.identificar({ pasatiempo: 'excavar' })).toBe('equivocado');
    expect(e.identificar({ pasatiempo: 'excavar', ropa: 'gris' })).toBe('ninguno');
    expect(e.identificado).toBe(false);
    expect(e.identificar({ pasatiempo: 'trepar', ropa: 'gris' })).toBe('identificado');
    expect(e.identificado).toBe(true);
  });

  it('pide la Crime Net solo antes de viajar al final', () => {
    const e = new EstadoCaso(CASO_GATO_DE_LA_SUERTE, 'aprendiz', fijo);
    expect(e.debeIdentificarAntesDeViajar).toBe(false);
    e.elegirDestino('ciudad-de-mexico');
    expect(e.debeIdentificarAntesDeViajar).toBe(true);
  });
});

describe('rango', () => {
  it('sube con los casos resueltos', () => {
    expect(rango(0)).toBe('Novata');
    expect(rango(1)).toBe('Exploradora');
    expect(rango(3)).toBe('Investigadora');
    expect(rango(100)).toBe('Detective estrella');
  });
});

describe('datos de los casos', () => {
  it.each(CASOS.map((c) => [c.id, c] as const))('%s usa ciudades y banderas que existen', (_, caso) => {
    expect(OPERATIVOS[caso.ladron]).toBeDefined();
    expect(CIUDADES[caso.final]).toBeDefined();
    for (const parada of caso.paradas) {
      expect(CIUDADES[parada.ciudad]).toBeDefined();
      for (const s of parada.senuelos) expect(CIUDADES[s]).toBeDefined();
      for (const t of parada.testigos) {
        const bandera = t.pista.imagen.match(/^bandera:(.+)$/);
        if (bandera) expect(CIUDADES[bandera[1] as keyof typeof CIUDADES]).toBeDefined();
        if (t.pista.rasgo) {
          // Una pista sobre el ladrón debe describirlo a él.
          expect(OPERATIVOS[caso.ladron].rasgos[t.pista.rasgo.categoria]).toBe(t.pista.rasgo.valor);
        }
        expect(t.pista.aprendiz.split(' ').length).toBeLessThanOrEqual(8);
      }
    }
  });
});
