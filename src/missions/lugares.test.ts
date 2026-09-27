import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CASOS } from '../data/casos';
import { CIUDADES } from '../data/ciudades';
import type { IdCiudad } from '../data/tipos';
import { ALCANCE, hayLineaDeVista } from '../gadgets/gancho';
import { crearCiudad, semillaDe, type Ciudad } from '../world/ciudad';
import { lugaresTestigos, rutaDeHuida, sobreAzotea } from './lugares';

/** Azoteas a las que se puede llegar encadenando ganchos desde el inicio. */
function alcanzables(ciudad: Ciudad): Set<number> {
  const vistas = new Set<number>();
  const pendientes: THREE.Vector3[] = [ciudad.inicio];
  while (pendientes.length) {
    const pies = pendientes.pop()!;
    const pecho = pies.clone().setY(pies.y + 2.4);
    ciudad.azoteas.forEach((azotea, i) => {
      if (vistas.has(i)) return;
      if (pecho.distanceTo(azotea.anclaje) > ALCANCE) return;
      if (!hayLineaDeVista(pecho, azotea.anclaje, ciudad.solidos)) return;
      vistas.add(i);
      pendientes.push(sobreAzotea(azotea));
    });
  }
  return vistas;
}

function indiceDe(ciudad: Ciudad, punto: THREE.Vector3): number {
  return ciudad.azoteas.findIndex((a) => sobreAzotea(a).distanceTo(punto) < 0.01);
}

const ciudadesDeCasos = new Set<IdCiudad>(CASOS.flatMap((c) => [...c.paradas.map((p) => p.ciudad), c.final]));

describe.each([...ciudadesDeCasos])('%s', (id) => {
  const ciudad = crearCiudad(CIUDADES[id].tema, semillaDe(id));
  const llegables = alcanzables(ciudad);

  it('los testigos están en azoteas alcanzables con el gancho', () => {
    for (const lugar of lugaresTestigos(ciudad, 3)) {
      expect(llegables.has(indiceDe(ciudad, lugar))).toBe(true);
    }
  });

  it('la ruta de huida tiene 3 azoteas alcanzables', () => {
    const ruta = rutaDeHuida(ciudad);
    expect(ruta).toHaveLength(3);
    for (const lugar of ruta) expect(llegables.has(indiceDe(ciudad, lugar))).toBe(true);
  });
});
