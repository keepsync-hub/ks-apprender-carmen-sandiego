import { sonar } from '../core/sonido';
import { hablar } from '../core/voz';
import { NOMBRES_CATEGORIA, OPCIONES_RASGOS, OPERATIVOS } from '../data/operativos';
import type { Categoria } from '../data/tipos';
import type { EstadoCaso, Seleccion } from '../missions/caso';
import { imagenPista } from './banderas';
import { boton, elemento, limpiar } from './pantallas';
import { dibujarRetrato } from './retratos';

// Crime Net: la computadora ámbar del juego de los 90. Se marcan los rasgos del
// ladrón que dicen las pistas y los sospechosos que no coinciden se apagan.

const MENSAJES = {
  varios: 'Todavía quedan varios. Marca otra pista.',
  ninguno: 'Nadie tiene esos rasgos. Revisa tus pistas.',
  equivocado: 'Hmm, las pistas no dicen eso. Revisa tu libreta.',
} as const;

export function mostrarCrimeNet(estado: EstadoCaso, alIdentificar: () => void): void {
  limpiar();
  const seleccion: Seleccion = {};
  const ventana = elemento('div', 'ventana crimenet');
  const titulo = 'CRIME NET';
  const instruccion = '¿Quién se llevó el tesoro? Marca lo que dicen tus pistas.';
  ventana.append(elemento('p', 'crimenet-titulo', titulo), elemento('p', 'texto', instruccion));

  const conocidos = estado.rasgosConocidos();
  if (conocidos.length) {
    const tira = elemento('div', 'tira-pistas');
    tira.append(
      elemento('span', 'etiqueta', 'Tus pistas:'),
      ...conocidos.map((r) => {
        const opcion = OPCIONES_RASGOS[r.categoria].find((o) => o.valor === r.valor)!;
        return imagenPista(opcion.imagen);
      }),
    );
    ventana.append(tira);
  }

  const sospechosos = elemento('div', 'sospechosos');
  const fichas = Object.values(OPERATIVOS).map((op) => {
    const ficha = elemento('div', 'ficha');
    ficha.dataset.id = op.id;
    ficha.append(dibujarRetrato(op.id), elemento('span', '', op.nombre));
    sospechosos.append(ficha);
    return ficha;
  });
  const actualizar = () => {
    const quedan = new Set(estado.sospechosos(seleccion).map((op) => op.id));
    for (const ficha of fichas) ficha.classList.toggle('descartado', !quedan.has(ficha.dataset.id as never));
  };

  for (const categoria of Object.keys(OPCIONES_RASGOS) as Categoria[]) {
    const grupo = elemento('div', 'grupo-rasgo');
    grupo.append(elemento('p', 'etiqueta', NOMBRES_CATEGORIA[categoria]));
    const botones = elemento('div', 'botones');
    const lista = OPCIONES_RASGOS[categoria].map((opcion) => {
      const b = boton('', () => {
        const yaEstaba = seleccion[categoria] === opcion.valor;
        if (yaEstaba) delete seleccion[categoria];
        else seleccion[categoria] = opcion.valor;
        for (const otro of lista) otro.classList.toggle('elegido', otro === b && !yaEstaba);
        actualizar();
      });
      b.classList.add('boton-rasgo');
      b.ariaLabel = opcion.etiqueta;
      b.append(imagenPista(opcion.imagen), elemento('small', '', opcion.etiqueta));
      return b;
    });
    botones.append(...lista);
    grupo.append(botones);
    ventana.append(grupo);
  }

  const mensaje = elemento('p', 'texto mensaje-crimenet');
  const buscar = boton('Buscar', () => {
    const resultado = estado.identificar(seleccion);
    if (resultado === 'identificado') {
      const nombre = OPERATIVOS[estado.caso.ladron].nombre;
      mensaje.textContent = `¡Es ${nombre}! Orden lista.`;
      hablar(`¡Es ${nombre}! Ahora vamos a atraparlo.`);
      sonar('fanfarria');
      buscar.disabled = true;
      window.setTimeout(() => {
        limpiar();
        alIdentificar();
      }, 2200);
    } else {
      mensaje.textContent = MENSAJES[resultado];
      hablar(MENSAJES[resultado]);
    }
  });
  ventana.append(sospechosos, mensaje, buscar);
  document.getElementById('ui')!.append(ventana);
  hablar(`Crime Net. ${instruccion}`);
}
