import { sonar, type Efecto } from '../core/sonido';
import { hablar } from '../core/voz';
import { BOTONES, Hackeo } from '../gadgets/labial';
import { boton, elemento, limpiar } from './pantallas';

// Pantalla del labial hacker: una terminal verde de los 90. Primero la
// computadora muestra la secuencia; luego la niña o el niño la repite.

export interface OpcionesHackeo {
  largo: number;
  /** Milisegundos que se ilumina cada botón al mostrar la secuencia. */
  msPorPaso: number;
  alLograrlo: () => void;
  alSalir: () => void;
}

const esperar = (ms: number) => new Promise((listo) => window.setTimeout(listo, ms));

export function mostrarHackeo(opciones: OpcionesHackeo): void {
  limpiar();
  const hackeo = new Hackeo(opciones.largo);
  // En modo ?prueba, las pruebas automáticas pueden leer la secuencia.
  const prueba = (window as unknown as { juego?: Record<string, unknown> }).juego;
  if (prueba) prueba.secuenciaHackeo = hackeo.secuencia;
  let turnoDeJugar = false;
  let cerrado = false;

  const ventana = elemento('div', 'ventana terminal');
  const titulo = elemento('p', 'terminal-titulo', '💄 LABIAL HACKER');
  const estado = elemento('p', 'texto terminal-estado');
  const progreso = elemento('div', 'terminal-progreso');
  const casillas = hackeo.secuencia.map(() => {
    const c = elemento('span', 'casilla');
    progreso.append(c);
    return c;
  });
  const tablero = elemento('div', 'tablero-hackeo');
  const botones = BOTONES.map((datos, i) => {
    const b = elemento('button', 'boton-hackeo', datos.forma);
    b.style.setProperty('--color', datos.color);
    b.ariaLabel = datos.nombre;
    b.addEventListener('click', () => tocar(i));
    tablero.append(b);
    return b;
  });
  const salir = boton('Salir', () => {
    cerrado = true;
    limpiar();
    opciones.alSalir();
  });
  salir.classList.add('boton-salir');
  ventana.append(titulo, estado, progreso, tablero, salir);
  document.getElementById('ui')!.append(ventana);

  const decir = (texto: string) => {
    estado.textContent = texto;
    hablar(texto);
  };

  const pintarProgreso = () =>
    casillas.forEach((c, i) => c.classList.toggle('lista', i < hackeo.aciertos));

  async function iluminar(i: number, ms: number): Promise<void> {
    botones[i].classList.add('encendido');
    sonar(`nota${i}` as Efecto);
    await esperar(ms);
    botones[i].classList.remove('encendido');
  }

  async function mostrarSecuencia(): Promise<void> {
    turnoDeJugar = false;
    tablero.classList.add('mirando');
    pintarProgreso();
    await esperar(900);
    for (const i of hackeo.secuencia) {
      if (cerrado) return;
      await iluminar(i, opciones.msPorPaso);
      await esperar(opciones.msPorPaso * 0.4);
    }
    if (cerrado) return;
    tablero.classList.remove('mirando');
    turnoDeJugar = true;
    decir('¡Tu turno! Toca los mismos colores.');
  }

  async function tocar(i: number): Promise<void> {
    if (!turnoDeJugar || cerrado) return;
    void iluminar(i, 250);
    const resultado = hackeo.tocar(i);
    pintarProgreso();
    if (resultado === 'error') {
      turnoDeJugar = false;
      sonar('error');
      decir('¡Casi! Mira otra vez.');
      await esperar(700);
      void mostrarSecuencia();
    } else if (resultado === 'completo') {
      turnoDeJugar = false;
      ventana.classList.add('concedido');
      titulo.textContent = '¡ACCESO CONCEDIDO!';
      sonar('fanfarria');
      decir('¡Acceso concedido!');
      await esperar(1600);
      if (cerrado) return;
      limpiar();
      opciones.alLograrlo();
    }
  }

  decir('Mira los colores y repítelos.');
  void mostrarSecuencia();
}
