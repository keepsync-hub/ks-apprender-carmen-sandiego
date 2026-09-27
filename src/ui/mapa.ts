import { CIUDADES } from '../data/ciudades';
import type { IdCiudad } from '../data/tipos';
import { sonar } from '../core/sonido';
import { hablar } from '../core/voz';
import { banderaSvg, imagenPista } from './banderas';
import { boton, elemento, limpiar } from './pantallas';

// Mapamundi retro: continentes pixelados, puntos de ciudades y una línea punteada
// por donde vuela el avión de Zack, como en el juego de 1985.

/** Continentes muy simplificados como [longitud, latitud]. */
const CONTINENTES: [number, number][][] = [
  // América del Norte
  [[-168, 65], [-140, 70], [-95, 72], [-75, 62], [-55, 50], [-80, 25], [-97, 17], [-83, 9], [-105, 22], [-118, 33], [-125, 48], [-150, 60]],
  // América del Sur
  [[-80, 10], [-60, 10], [-35, -6], [-40, -22], [-58, -38], [-68, -55], [-75, -45], [-72, -18], [-81, -5]],
  // Europa
  [[-10, 36], [0, 44], [-5, 48], [5, 58], [25, 70], [40, 66], [40, 45], [25, 36]],
  // África
  [[-17, 21], [-5, 36], [12, 37], [33, 31], [43, 12], [51, 11], [40, -15], [20, -35], [12, -18], [8, 4], [-8, 5]],
  // Asia
  [[40, 45], [40, 66], [70, 72], [140, 72], [180, 66], [160, 58], [140, 40], [122, 30], [108, 20], [100, 5], [80, 8], [72, 20], [58, 25], [48, 30], [35, 36]],
  // Japón
  [[130, 31], [141, 36], [142, 43], [135, 35]],
  // Oceanía
  [[114, -22], [130, -12], [142, -11], [153, -27], [146, -39], [117, -35]],
];

const x = (lon: number) => lon + 180;
const y = (lat: number) => 90 - lat;

function svgMapa(origen: IdCiudad, opciones: IdCiudad[]): string {
  const tierra = CONTINENTES.map(
    (c) => `<polygon points="${c.map(([lon, lat]) => `${x(lon)},${y(lat)}`).join(' ')}" />`,
  ).join('');
  const o = CIUDADES[origen];
  const puntos = opciones
    .map((id) => {
      const c = CIUDADES[id];
      return `<circle class="punto" data-ciudad="${id}" cx="${x(c.lon)}" cy="${y(c.lat)}" r="3"/>`;
    })
    .join('');
  return `
    <svg class="mapamundi" viewBox="0 0 360 180" role="img" aria-label="Mapamundi">
      <rect width="360" height="180" class="oceano"/>
      <g class="tierra">${tierra}</g>
      <line class="ruta" x1="${x(o.lon)}" y1="${y(o.lat)}" x2="${x(o.lon)}" y2="${y(o.lat)}"/>
      ${puntos}
      <circle class="punto origen" cx="${x(o.lon)}" cy="${y(o.lat)}" r="3.5"/>
      <text class="avion" x="${x(o.lon)}" y="${y(o.lat)}">✈</text>
    </svg>`;
}

export interface OpcionesMapa {
  origen: IdCiudad;
  opciones: IdCiudad[];
  aprendiz: boolean;
  /** Devuelve true si el destino es correcto. */
  alElegir: (destino: IdCiudad) => boolean;
  /** Se llama al terminar el vuelo al destino correcto. */
  alLlegar: (destino: IdCiudad) => void;
  /** Pista extra de Player cuando se equivoca. */
  ayuda: string;
  /** Imágenes de las pistas de destino de esta ciudad, para comparar con las tarjetas. */
  pistas: string[];
}

export function mostrarMapa(opciones: OpcionesMapa): void {
  limpiar();
  const ventana = elemento('div', 'ventana ventana-mapa');
  const pregunta = '¿A dónde fue el ladrón?';
  ventana.append(elemento('p', 'subtitulo', pregunta));
  const tira = elemento('div', 'tira-pistas');
  tira.append(elemento('span', 'etiqueta', 'Tus pistas:'), ...opciones.pistas.map(imagenPista));
  ventana.append(tira);
  const mapa = elemento('div', 'marco-mapa');
  mapa.innerHTML = svgMapa(opciones.origen, opciones.opciones);
  ventana.append(mapa);
  const mensaje = elemento('p', 'texto mensaje-mapa');
  const tarjetas = elemento('div', 'tarjetas-destino');

  const svg = mapa.querySelector('svg')!;
  const ruta = svg.querySelector<SVGLineElement>('.ruta')!;
  const avion = svg.querySelector<SVGTextElement>('.avion')!;
  const o = CIUDADES[opciones.origen];

  const apuntar = (id: IdCiudad) => {
    const c = CIUDADES[id];
    ruta.setAttribute('x2', String(x(c.lon)));
    ruta.setAttribute('y2', String(y(c.lat)));
  };

  const volar = (id: IdCiudad) => {
    const c = CIUDADES[id];
    const inicio = performance.now();
    const duracion = 1400;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      avion.setAttribute('x', String(x(o.lon) + (x(c.lon) - x(o.lon)) * t));
      avion.setAttribute('y', String(y(o.lat) + (y(c.lat) - y(o.lat)) * t));
      if (t < 1) requestAnimationFrame(paso);
      else {
        limpiar();
        opciones.alLlegar(id);
      }
    };
    requestAnimationFrame(paso);
  };

  for (const id of opciones.opciones) {
    const c = CIUDADES[id];
    const tarjeta = boton('', () => {
      if (tarjetas.classList.contains('volando')) return;
      apuntar(id);
      if (opciones.alElegir(id)) {
        tarjetas.classList.add('volando');
        tarjeta.classList.add('correcta');
        mensaje.textContent = `¡Vamos a ${c.nombre}!`;
        hablar(`¡Vamos a ${c.nombre}!`);
        sonar('fanfarria');
        volar(id);
      } else {
        tarjeta.classList.add('equivocada');
        tarjeta.disabled = true;
        mensaje.textContent = opciones.ayuda;
        hablar(opciones.ayuda);
      }
    });
    tarjeta.classList.add('tarjeta-destino');
    tarjeta.replaceChildren();
    const bandera = elemento('span', 'tarjeta-bandera');
    bandera.innerHTML = banderaSvg(id);
    tarjeta.append(
      bandera,
      elemento('span', 'tarjeta-icono', c.icono),
      elemento('span', 'tarjeta-nombre', opciones.aprendiz ? c.pais : `${c.nombre}, ${c.pais}`),
    );
    tarjeta.addEventListener('pointerenter', () => apuntar(id));
    tarjetas.append(tarjeta);
  }

  ventana.append(tarjetas, mensaje);
  document.getElementById('ui')!.append(ventana);
  hablar(`${pregunta} Mira tus pistas y elige.`);
}
