import type { Ajustes, Dificultad } from '../core/guardado';
import { sonar } from '../core/sonido';
import { callar, hablar } from '../core/voz';
import { imagenPista } from './banderas';
import { dibujarRetrato, type Personaje } from './retratos';

const raiz = document.getElementById('ui') as HTMLDivElement;

let dificultad: Dificultad = 'detective';

/** El nivel cambia los textos (más simples en Aprendiz) y el tamaño de letra. */
export function configurarDificultad(nueva: Dificultad): void {
  dificultad = nueva;
  document.body.classList.toggle('aprendiz', nueva === 'aprendiz');
}

export function limpiar(): void {
  callar();
  raiz.replaceChildren();
}

export function elemento<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}

export function boton(texto: string, alPulsar: () => void, detalle?: string): HTMLButtonElement {
  const b = elemento('button', 'boton', texto);
  if (detalle) b.append(elemento('small', '', detalle));
  b.addEventListener('click', () => {
    sonar('clic');
    alPulsar();
  });
  return b;
}

export function mostrarTitulo(alEmpezar: () => void): void {
  limpiar();
  const ventana = elemento('div', 'ventana');
  const botones = elemento('div', 'botones');
  botones.append(boton('Empezar', alEmpezar));
  ventana.append(
    elemento('h1', 'titulo', 'Carmen Sandiego'),
    elemento('p', 'subtitulo', '¡Ladrona de ladrones!'),
    botones,
  );
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
  /** Versión más corta y simple para el nivel Aprendiz. */
  aprendiz?: string;
  /** Nombre a mostrar si no es el del personaje (por ejemplo, un testigo). */
  nombre?: string;
  /** Imagen grande de la pista (emoji, `bandera:<id>` o `color:#rrggbb`). */
  imagen?: string;
}

const NOMBRES: Record<Personaje, string> = {
  player: 'Player',
  carmen: 'Carmen',
  zack: 'Zack',
  ivy: 'Ivy',
  jefa: 'La Jefa',
  chase: 'Chase Devineaux',
  'le-chevre': 'Le Chèvre',
  'el-topo': 'El Topo',
  tigress: 'Tigress',
  paperstar: 'Paperstar',
  testigo: 'Testigo',
};

export function textoSegunNivel(linea: { texto: string; aprendiz?: string }, nivel: Dificultad): string {
  return nivel === 'aprendiz' && linea.aprendiz ? linea.aprendiz : linea.texto;
}

/** Milisegundos por letra del efecto máquina de escribir. */
const MS_POR_LETRA = 28;
/** Toques más rápidos que esto tras aparecer una línea se ignoran (doble toque sin querer). */
const MS_ANTES_DE_AVANZAR = 350;

/**
 * Muestra un diálogo línea por línea, narrado en voz alta. En Detective el texto
 * aparece letra a letra como en los 90; en Aprendiz aparece entero de una vez para
 * que la voz y el texto vayan juntos.
 */
export function dialogo(lineas: Linea[], alTerminar: () => void, textoFinal = '¡Vamos!'): void {
  let i = 0;
  let temporizador = 0;
  const mostrar = () => {
    limpiar();
    window.clearInterval(temporizador);
    const linea = lineas[i];
    const texto = textoSegunNivel(linea, dificultad);
    const caja = elemento('div', 'ventana dialogo');
    const cuerpo = elemento('div', '');
    const parrafo = elemento('p', 'texto');
    const botones = elemento('div', 'botones');
    const ultima = i === lineas.length - 1;

    const mostradaEn = performance.now();
    let letras = dificultad === 'aprendiz' ? texto.length : 0;
    const escribiendo = () => letras < texto.length;
    parrafo.textContent = texto.slice(0, letras);
    if (escribiendo()) {
      temporizador = window.setInterval(() => {
        letras++;
        parrafo.textContent = texto.slice(0, letras);
        if (letras % 3 === 0) sonar('letra');
        if (!escribiendo()) window.clearInterval(temporizador);
      }, MS_POR_LETRA);
    }

    const escuchar = boton('🔊', () => hablar(texto));
    escuchar.classList.add('icono');
    escuchar.ariaLabel = 'Escuchar de nuevo';
    const seguir = boton(ultima ? textoFinal : 'Seguir ▶', () => {
      // Primer toque mientras escribe: mostrar todo el texto de una vez.
      if (escribiendo()) {
        letras = texto.length;
        parrafo.textContent = texto;
        window.clearInterval(temporizador);
        return;
      }
      if (performance.now() - mostradaEn < MS_ANTES_DE_AVANZAR) return;
      i++;
      if (i < lineas.length) mostrar();
      else {
        limpiar();
        alTerminar();
      }
    });
    botones.append(escuchar, seguir);
    cuerpo.append(elemento('p', 'nombre', linea.nombre ?? NOMBRES[linea.quien]));
    if (linea.imagen) cuerpo.append(imagenPista(linea.imagen));
    cuerpo.append(parrafo, botones);
    caja.append(dibujarRetrato(linea.quien), cuerpo);
    raiz.append(caja);
    seguir.focus();
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
  sonar('aviso');
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

/** Botón de pausa fijo arriba a la derecha (solo visible mientras se juega). */
export function crearBotonPausa(alPulsar: () => void): HTMLButtonElement {
  const b = boton('II', alPulsar);
  b.classList.add('boton-pausa');
  b.ariaLabel = 'Pausa y ajustes';
  document.body.append(b);
  return b;
}

export interface OpcionesPausa {
  ajustes: Ajustes;
  dificultad: Dificultad;
  alCambiarAjustes: (ajustes: Ajustes) => void;
  alCambiarDificultad: (d: Dificultad) => void;
  alSeguir: () => void;
  alSalir: () => void;
}

/** Menú de pausa con ajustes grandes de Sí/No, pensados para manos pequeñas. */
export function menuPausa(opciones: OpcionesPausa): void {
  limpiar();
  const ajustes = { ...opciones.ajustes };
  let nivel = opciones.dificultad;
  const ventana = elemento('div', 'ventana menu-pausa');
  const lista = elemento('div', 'ajustes');

  const fila = (etiqueta: string, valor: () => string, alternar: () => void) => {
    const f = elemento('div', 'ajuste');
    const b = boton(valor(), () => {
      alternar();
      b.textContent = valor();
    });
    b.classList.add('boton-ajuste');
    f.append(elemento('span', 'etiqueta', etiqueta), b);
    lista.append(f);
  };
  const siNo = (v: boolean) => (v ? 'Sí' : 'No');
  const cambiar = (clave: keyof Ajustes) => () => {
    ajustes[clave] = !ajustes[clave];
    opciones.alCambiarAjustes({ ...ajustes });
  };

  fila('Voz', () => siNo(ajustes.voz), cambiar('voz'));
  fila('Sonidos', () => siNo(ajustes.sonido), cambiar('sonido'));
  fila('Efecto TV', () => siNo(ajustes.efectoTv), cambiar('efectoTv'));
  fila(
    'Nivel',
    () => (nivel === 'aprendiz' ? 'Aprendiz' : 'Detective'),
    () => {
      nivel = nivel === 'aprendiz' ? 'detective' : 'aprendiz';
      opciones.alCambiarDificultad(nivel);
    },
  );

  const botones = elemento('div', 'botones');
  const seguir = boton('Seguir jugando', () => {
    limpiar();
    opciones.alSeguir();
  });
  seguir.classList.add('boton-seguir');
  botones.append(
    seguir,
    boton('Salir al título', () => {
      limpiar();
      opciones.alSalir();
    }),
  );
  ventana.append(elemento('p', 'subtitulo', 'Pausa'), lista, botones);
  raiz.append(ventana);
  seguir.focus();
  hablar('Pausa.');
}
