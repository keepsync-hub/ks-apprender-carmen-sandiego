// Progreso guardado solo en este dispositivo. Sin cuentas ni servidores.

export type Dificultad = 'aprendiz' | 'detective';

export interface Ajustes {
  voz: boolean;
  sonido: boolean;
  /** Líneas de TV antigua sobre la pantalla. */
  efectoTv: boolean;
}

export interface Progreso {
  dificultad: Dificultad | null;
  ajustes: Ajustes;
  /** Ids de los casos resueltos (sin repetir). */
  casosResueltos: string[];
  /** Mejor cantidad de estrellas por caso. */
  estrellas: Record<string, number>;
}

const CLAVE = 'carmen-progreso-v1';

function ajustesIniciales(): Ajustes {
  const reducirMovimiento =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { voz: true, sonido: true, efectoTv: !reducirMovimiento };
}

export function cargarProgreso(): Progreso {
  const inicial: Progreso = {
    dificultad: null,
    ajustes: ajustesIniciales(),
    casosResueltos: [],
    estrellas: {},
  };
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) {
      const datos = JSON.parse(guardado) as Partial<Progreso>;
      return {
        ...inicial,
        ...datos,
        ajustes: { ...inicial.ajustes, ...datos.ajustes },
      };
    }
  } catch {
    // Sin almacenamiento (modo privado) o datos dañados: se juega igual, sin guardar.
  }
  return inicial;
}

export function guardarProgreso(progreso: Progreso): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(progreso));
  } catch {
    // Ignorar: el juego funciona sin guardar.
  }
}
