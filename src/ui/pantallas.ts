import type { Dificultad } from '../core/guardado';
import { callar, hablar } from '../core/voz';
import { dibujarRetrato, type Personaje } from './retratos';

const raiz = document.getElementById('ui') as HTMLDivElement;

function limpiar(): void {
  callar();
  raiz.replaceChildren();
}

function elemento<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}

function boton(texto: string, alPulsar: () => void, detalle?: string): HTMLButtonElement {
  const b = elemento('button', 'boton', texto);
  if (detalle) b.append(elemento('small', '', detalle));
  b.addEventListener('click', alPulsar);
  return b;
}

export function mostrarTitulo(alEmpezar: () => void): void {
  limpiar();
  const ventana = elemento('div', 'ventana');
  ventana.append(
    elemento('h1', 'titulo', 'Carmen Sandiego'),
    elemento('p', 'subtitulo', '¡Ladrona de ladrones!'),
    elemento('div', 'botones'),
  );
  ventana.lastElementChild!.append(boton('Empezar', alEmpezar));
  raiz.append(ventana);
}

export function elegirDificultad(alElegir: (d: Dificultad) => void): void {
  limpiar();
  const pregunta = '¿Cómo quieres jugar?';
  const ventana = elemento('div', 'ventana');
  const botones = elemento('div', 'botones');
  botones.append(
    boton('Aprendiz', () => alElegir('aprendiz'), 'Estoy aprendiendo a leer'),
    boton('Detective', () => alElegir('detective'), 'Ya leo solo o sola'),
  );
  ventana.append(elemento('p', 'subtitulo', pregunta), botones);
  raiz.append(ventana);
  hablar(`${pregunta} Aprendiz, si estás aprendiendo a leer. Detective, si ya lees.`);
}

export interface Linea {
  quien: Personaje;
  texto: string;
}

const NOMBRES: Record<Personaje, string> = { player: 'Player', carmen: 'Carmen' };

/** Muestra un diálogo línea por línea, narrado en voz alta. */
export function dialogo(lineas: Linea[], alTerminar: () => void): void {
  let i = 0;
  const mostrar = () => {
    limpiar();
    const { quien, texto } = lineas[i];
    const caja = elemento('div', 'ventana dialogo');
    const cuerpo = elemento('div', '');
    const botones = elemento('div', 'botones');
    const ultima = i === lineas.length - 1;
    botones.append(
      Object.assign(boton('🔊', () => hablar(texto)), {
        className: 'boton icono',
        ariaLabel: 'Escuchar de nuevo',
      }),
      boton(ultima ? '¡Vamos!' : 'Seguir ▶', () => {
        i++;
        if (i < lineas.length) mostrar();
        else {
          limpiar();
          alTerminar();
        }
      }),
    );
    cuerpo.append(elemento('p', 'nombre', NOMBRES[quien]), elemento('p', 'texto', texto), botones);
    caja.append(dibujarRetrato(quien), cuerpo);
    raiz.append(caja);
    hablar(texto);
  };
  mostrar();
}

let temporizadorAviso = 0;

/** Mensaje corto de Player arriba de la pantalla; no detiene el juego. */
export function avisoPlayer(texto: string, segundos = 4): void {
  document.querySelector('.aviso-player')?.remove();
  window.clearTimeout(temporizadorAviso);
  const caja = elemento('div', 'ventana aviso-player');
  caja.append(dibujarRetrato('player'), elemento('p', 'texto', texto));
  document.body.append(caja);
  hablar(texto);
  temporizadorAviso = window.setTimeout(() => caja.remove(), segundos * 1000);
}

export function mostrarAvisoFan(): void {
  const aviso = elemento(
    'p',
    'aviso-fan',
    'Juego de fans, educativo y sin fines de lucro. Carmen Sandiego es marca de sus respectivos dueños.',
  );
  document.body.append(aviso);
}
