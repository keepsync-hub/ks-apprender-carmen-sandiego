import * as THREE from 'three';
import type { Azotea, Ciudad } from '../world/ciudad';

// Dónde se paran los testigos y por dónde huye el ladrón. Funciones puras para
// poder comprobar en pruebas que todo es alcanzable con el gancho.

/** Al lado del poste del anclaje, no encima. */
export function sobreAzotea(azotea: Azotea): THREE.Vector3 {
  return azotea.centro.clone().add(new THREE.Vector3(1.6, 0, 1.6));
}

/** Testigos repartidos: uno cerca (para empezar fácil) y otros más lejos. */
export function lugaresTestigos(ciudad: Ciudad, cantidad: number): THREE.Vector3[] {
  const indices = [0, 3, 6, 9];
  return indices
    .slice(0, cantidad)
    .map((i) => sobreAzotea(ciudad.azoteas[i % ciudad.azoteas.length]));
}

/** 3 azoteas encadenadas, cada una a un salto de gancho de la anterior. */
export function rutaDeHuida(ciudad: Ciudad): THREE.Vector3[] {
  const primera = ciudad.azoteas.find((a) => a.centro.distanceTo(ciudad.inicio) > 16) ?? ciudad.azoteas[0];
  const usadas = [primera];
  while (usadas.length < 3) {
    const anterior = usadas[usadas.length - 1];
    const siguiente = ciudad.azoteas
      .filter((a) => !usadas.includes(a))
      .map((a) => ({ a, d: Math.hypot(a.centro.x - anterior.centro.x, a.centro.z - anterior.centro.z) }))
      .filter(({ d }) => d > 7 && d < 20)
      .sort((x, y) => x.d - y.d)[0];
    if (!siguiente) break;
    usadas.push(siguiente.a);
  }
  return usadas.map(sobreAzotea);
}
