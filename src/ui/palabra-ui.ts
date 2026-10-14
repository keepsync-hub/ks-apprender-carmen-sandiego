import type { Dificultad } from '../core/guardado';
import { sonar } from '../core/sonido';
import { hablarFrases, type Frase } from '../core/voz';
import type { Palabra } from '../data/palabras';
import { cantidadOpciones, opcionesPara } from '../missions/palabras';
import { boton, elemento, limpiar, textoSegunNivel } from './pantallas';
import { dibujarRetrato, type Personaje } from './retratos';

// «Aprende una palabra», la dinámica de Aprender Jugando 3D: te dicen la palabra en
// inglés y una pista que no da la respuesta; tú deduces qué significa. Si te equivocas
// no pasa nada: esa opción se apaga y vuelves a intentarlo.

export interface OpcionesPalabra {
  palabra: Palabra;
  nivel: Dificultad;
  /** Quién enseña la palabra (retrato y nombre). */
  quien: Personaje;
  nombre?: string;
  /** Por qué aparece la palabra («Te doy mi pista si…»). */
  motivo: { texto: string; aprendiz: string };
  /** Se llama al acertar; indica si fue al primer intento. */
  alTerminar: (alPrimerIntento: boolean) => void;
}

export function mostrarPalabra({ palabra, nivel, quien, nombre, motivo, alTerminar }: OpcionesPalabra): void {
  limpiar();
  const aprendiz = nivel === 'aprendiz';
  const opciones = opcionesPara(palabra, cantidadOpciones(nivel));
  let intentos = 0;

  const ventana = elemento('div', 'ventana palabra');
  const cabecera = elemento('div', 'palabra-cabecera');
  cabecera.append(dibujarRetrato(quien), elemento('p', 'nombre', nombre ?? ''));

  const bocadillo = elemento('p', 'texto palabra-bocadillo');
  const intro = textoSegunNivel(motivo, nivel);
  bocadillo.append(`${intro} `);
  bocadillo.append(aprendiz ? 'Esta palabra es ' : 'Hoy aprenderás la palabra ');
  bocadillo.append(elemento('strong', '', `«${palabra.en}»`));
  bocadillo.append('.');
  const pista = elemento('p', 'palabra-pista');
  pista.append(elemento('span', 'palabra-pista-etiqueta', '💡 Pista'), elemento('span', '', palabra.pista));

  const grande = elemento('div', 'palabra-grande');
  const escuchar = boton('🔊', () => narrar());
  escuchar.classList.add('icono');
  escuchar.ariaLabel = 'Escuchar de nuevo';
  grande.append(elemento('span', 'palabra-en', palabra.en), escuchar);

  const pregunta = elemento('p', 'etiqueta', `¿Qué significa «${palabra.en}»?`);
  const lista = elemento('div', `palabra-opciones opciones-${opciones.length}`);
  const aviso = elemento('p', 'palabra-aviso');
  const botones = elemento('div', 'botones');

  const narrar = () => {
    const frases: Frase[] = [
      { texto: intro },
      { texto: aprendiz ? 'Esta palabra es' : 'Hoy aprenderás la palabra' },
      { texto: palabra.en, ingles: true },
      { texto: `Pista: ${palabra.pista}` },
      { texto: '¿Qué significa?' },
      // Quien aún no lee escucha las opciones.
      { texto: aprendiz ? `¿${opciones.map((o) => o.es).join(', o ')}?` : '' },
    ];
    hablarFrases(frases);
  };

  for (const opcion of opciones) {
    const b = elemento('button', 'boton palabra-opcion');
    if (aprendiz) b.append(elemento('span', 'palabra-emoji', opcion.emoji));
    b.append(elemento('span', '', opcion.es));
    b.addEventListener('click', () => {
      intentos++;
      if (opcion.id !== palabra.id) {
        sonar('error');
        b.disabled = true;
        b.classList.add('equivocada');
        aviso.className = 'palabra-aviso mal';
        aviso.textContent = '¡Casi! Vuelve a leer la pista e inténtalo otra vez.';
        hablarFrases([{ texto: '¡Casi! Escucha la pista otra vez.' }, { texto: palabra.pista }]);
        return;
      }
      sonar('fanfarria');
      for (const otro of lista.querySelectorAll('button')) otro.disabled = true;
      b.classList.add('correcta');
      aviso.className = 'palabra-aviso bien';
      aviso.replaceChildren(
        elemento('span', 'palabra-emoji', palabra.emoji),
        elemento('span', '', `¡Correcto! «${palabra.en}» significa «${palabra.es}».`),
      );
      hablarFrases([
        { texto: '¡Correcto!' },
        { texto: palabra.en, ingles: true },
        { texto: `significa ${palabra.es}.` },
      ]);
      const seguir = boton('Seguir ▶', () => {
        limpiar();
        alTerminar(intentos === 1);
      });
      botones.replaceChildren(seguir);
      seguir.focus();
    });
    lista.append(b);
  }

  ventana.append(
    elemento('p', 'subtitulo', '📖 Aprende una palabra'),
    cabecera,
    bocadillo,
    grande,
    pista,
    pregunta,
    lista,
    aviso,
    botones,
  );
  document.getElementById('ui')!.append(ventana);
  narrar();
}
