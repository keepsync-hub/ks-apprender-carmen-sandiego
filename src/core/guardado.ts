// Progreso guardado solo en este dispositivo. Sin cuentas ni servidores.

export type Dificultad = 'aprendiz' | 'detective';

export interface Progreso {
  dificultad: Dificultad | null;
}

const CLAVE = 'carmen-progreso-v1';

export function cargarProgreso(): Progreso {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return { dificultad: null, ...JSON.parse(guardado) };
  } catch {
    // Sin almacenamiento (modo privado): se juega igual, sin guardar.
  }
  return { dificultad: null };
}

export function guardarProgreso(progreso: Progreso): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(progreso));
  } catch {
    // Ignorar: el juego funciona sin guardar.
  }
}
