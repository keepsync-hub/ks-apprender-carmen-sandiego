import { sonar } from '../core/sonido';
import { hablar } from '../core/voz';
import { CIUDADES } from '../data/ciudades';
import type { Caso, Pista } from '../data/tipos';
import type { EstadoCaso } from '../missions/caso';
import { banderaSvg, imagenPista } from './banderas';
import { boton, elemento, limpiar, textoSegunNivel } from './pantallas';

/** Libreta con todas las pistas escuchadas; cada una se puede volver a escuchar. */
export function mostrarLibreta(estado: EstadoCaso, alCerrar: () => void): void {
  limpiar();
  const ventana = elemento('div', 'ventana libreta');
  ventana.append(elemento('p', 'subtitulo', 'Libreta de pistas'));
  const lista = elemento('div', 'lista-pistas');
  if (!estado.pistas.length) {
    lista.append(elemento('p', 'texto', 'Todavía no tienes pistas. ¡Habla con los testigos!'));
  }
  for (const pista of estado.pistas) {
    const texto = textoPista(pista, estado);
    const fila = boton('', () => hablar(texto));
    fila.classList.add('fila-pista');
    fila.append(imagenPista(pista.imagen), elemento('span', '', texto));
    lista.append(fila);
  }
  const botones = elemento('div', 'botones');
  botones.append(
    boton('Cerrar', () => {
      limpiar();
      alCerrar();
    }),
  );
  ventana.append(lista, botones);
  document.getElementById('ui')!.append(ventana);
}

export function textoPista(pista: Pista, estado: EstadoCaso): string {
  return textoSegunNivel(pista, estado.nivel);
}

export interface OpcionesResultado {
  estado: EstadoCaso;
  rango: string;
  subioDeRango: boolean;
  alTitulo: () => void;
}

/** Pantalla final: estrellas, rango y lo aprendido en cada ciudad. */
export function mostrarResultado({ estado, rango, subioDeRango, alTitulo }: OpcionesResultado): void {
  limpiar();
  const estrellas = estado.estrellas();
  const ventana = elemento('div', 'ventana resultado');
  ventana.append(
    elemento('p', 'subtitulo', '¡Caso resuelto!'),
    elemento('p', 'estrellas', '★'.repeat(estrellas) + '☆'.repeat(3 - estrellas)),
    elemento('p', 'texto', subioDeRango ? `¡Subiste de rango! Ahora eres ${rango}.` : `Tu rango: ${rango}.`),
    elemento('p', 'etiqueta', 'Aprendiste:'),
  );
  const cartas = elemento('div', 'cartas-ciudad');
  for (const id of estado.ciudadesVisitadas) {
    const c = CIUDADES[id];
    const carta = boton('', () => hablar(`${c.nombre}. ${c.datoCurioso}`));
    carta.classList.add('carta-ciudad');
    carta.append(
      elemento('span', 'tarjeta-icono', c.icono),
      elemento('strong', '', `${c.nombre}, ${c.pais}`),
      elemento('span', '', c.datoCurioso),
    );
    cartas.append(carta);
  }
  const botones = elemento('div', 'botones');
  botones.append(
    boton('Volver al título', () => {
      limpiar();
      alTitulo();
    }),
  );
  ventana.append(cartas, botones);
  document.getElementById('ui')!.append(ventana);
  sonar('fanfarria');
  hablar(
    `¡Caso resuelto! Ganaste ${estrellas} ${estrellas === 1 ? 'estrella' : 'estrellas'}. ` +
      (subioDeRango ? `¡Ahora eres ${rango}!` : ''),
  );
}

export interface OpcionesElegirCaso {
  casos: Caso[];
  /** Mejores estrellas por id de caso. */
  estrellas: Record<string, number>;
  alElegir: (caso: Caso) => void;
  alVolver: () => void;
}

/**
 * Tarjetas grandes con el tesoro, la ciudad donde empieza y las estrellas ganadas.
 * No se muestra la ruta completa: sería darle las respuestas del mapa.
 */
export function elegirCaso({ casos, estrellas, alElegir, alVolver }: OpcionesElegirCaso): void {
  limpiar();
  const ventana = elemento('div', 'ventana elegir-caso');
  const pregunta = 'Elige un caso';
  ventana.append(elemento('p', 'subtitulo', pregunta));
  const lista = elemento('div', 'lista-casos');
  for (const caso of casos) {
    const ganadas = estrellas[caso.id] ?? 0;
    const tarjeta = boton('', () => {
      limpiar();
      alElegir(caso);
    });
    tarjeta.classList.add('tarjeta-caso');
    const inicio = caso.paradas[0].ciudad;
    const ruta = elemento('span', 'ruta-caso');
    ruta.innerHTML = banderaSvg(inicio);
    ruta.append(elemento('span', '', `Empieza en ${CIUDADES[inicio].nombre}`));
    tarjeta.append(
      elemento('span', 'tarjeta-icono', caso.iconoTesoro),
      elemento('strong', 'tarjeta-titulo', caso.titulo),
      ruta,
      elemento(
        'span',
        'estrellas-caso',
        ganadas ? '★'.repeat(ganadas) + '☆'.repeat(3 - ganadas) : '¡Nuevo!',
      ),
    );
    tarjeta.addEventListener('pointerenter', () => hablar(caso.titulo));
    lista.append(tarjeta);
  }
  const botones = elemento('div', 'botones');
  botones.append(
    boton('Volver', () => {
      limpiar();
      alVolver();
    }),
  );
  ventana.append(lista, botones);
  document.getElementById('ui')!.append(ventana);
  hablar(`${pregunta}. ${casos.map((c) => c.titulo).join('. ')}.`);
}
