import type { Dificultad } from '../core/guardado';
import { PALABRAS, type Palabra } from '../data/palabras';

// Reglas de «aprender una palabra», iguales a las de Aprender Jugando 3D:
// - Primero se enseñan las palabras nuevas, en orden.
// - Cuando ya se aprendieron todas, se repasan las de menor dominio (⭐ a ⭐⭐⭐).
// - Acertar al primer intento sube el dominio; fallar una ya aprendida lo baja.

/** Dominio de cada palabra aprendida (1 a 3), por id. */
export type Vocabulario = Record<string, number>;

export const DOMINIO_MAXIMO = 3;

/**
 * La siguiente palabra para enseñar. `usadas` son las que ya salieron en este caso,
 * para no repetir la misma palabra dos veces seguidas.
 */
export function elegirPalabra(vocabulario: Vocabulario, usadas: string[] = [], lista = PALABRAS): Palabra {
  const disponibles = lista.filter((p) => !usadas.includes(p.id));
  const candidatas = disponibles.length ? disponibles : lista;
  const nueva = candidatas.find((p) => !vocabulario[p.id]);
  if (nueva) return nueva;
  // Repaso: la de menor dominio (la primera de la lista si empatan).
  return candidatas.reduce((menor, p) => (vocabulario[p.id] < vocabulario[menor.id] ? p : menor));
}

/** Aprendiz elige entre 2 significados (como en el resto del juego); Detective entre 4. */
export function cantidadOpciones(nivel: Dificultad): number {
  return nivel === 'aprendiz' ? 2 : 4;
}

/** El significado correcto y señuelos de otras palabras, mezclados. */
export function opcionesPara(
  palabra: Palabra,
  cantidad: number,
  azar: () => number = Math.random,
  lista = PALABRAS,
): Palabra[] {
  const otras = mezclar(
    lista.filter((p) => p.id !== palabra.id && p.es !== palabra.es),
    azar,
  );
  return mezclar([palabra, ...otras.slice(0, cantidad - 1)], azar);
}

function mezclar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Devuelve el vocabulario actualizado tras responder (sin modificar el original). */
export function registrarRespuesta(vocabulario: Vocabulario, id: string, alPrimerIntento: boolean): Vocabulario {
  const actual = vocabulario[id] ?? 0;
  let dominio: number;
  if (!actual) dominio = 1; // se aprende al acertar, aunque haya costado
  else if (alPrimerIntento) dominio = Math.min(DOMINIO_MAXIMO, actual + 1);
  else dominio = Math.max(1, actual - 1);
  return { ...vocabulario, [id]: dominio };
}
