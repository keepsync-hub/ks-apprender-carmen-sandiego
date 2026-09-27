// Labial hacker: minijuego de secuencia de colores («Simón dice»). Lógica pura,
// sin pantallas, para poder probarla.

export const BOTONES = [
  { color: '#e63946', forma: '●', nombre: 'rojo' },
  { color: '#2a9df4', forma: '▲', nombre: 'azul' },
  { color: '#ffd23f', forma: '■', nombre: 'amarillo' },
  { color: '#3bb273', forma: '★', nombre: 'verde' },
] as const;

export type ResultadoToque = 'bien' | 'error' | 'completo';

export class Hackeo {
  readonly secuencia: number[];
  /** Cuántos botones de la secuencia ya repitió bien en este intento. */
  aciertos = 0;
  errores = 0;

  constructor(largo: number, azar: () => number = Math.random) {
    this.secuencia = [];
    for (let i = 0; i < largo; i++) {
      let boton = Math.floor(azar() * BOTONES.length);
      // Sin el mismo botón dos veces seguidas: es difícil de ver para los más pequeños.
      if (boton === this.secuencia[i - 1]) boton = (boton + 1) % BOTONES.length;
      this.secuencia.push(boton);
    }
  }

  get completo(): boolean {
    return this.aciertos >= this.secuencia.length;
  }

  tocar(boton: number): ResultadoToque {
    if (this.completo) return 'completo';
    if (boton !== this.secuencia[this.aciertos]) {
      // Sin castigo: se vuelve a mostrar la secuencia desde el principio.
      this.errores++;
      this.aciertos = 0;
      return 'error';
    }
    this.aciertos++;
    return this.completo ? 'completo' : 'bien';
  }
}

export function largoSegunNivel(nivel: 'aprendiz' | 'detective'): number {
  return nivel === 'aprendiz' ? 3 : 4;
}
