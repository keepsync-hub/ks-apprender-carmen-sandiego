import '@fontsource/press-start-2p/400.css';
import './style.css';
import * as THREE from 'three';
import { crearEntrada, esTactil } from './core/entrada';
import { cargarProgreso, guardarProgreso, type Ajustes } from './core/guardado';
import { configurarSonido, sonar } from './core/sonido';
import { configurarVoz } from './core/voz';
import { CASO_GATO_DE_LA_SUERTE } from './data/casos';
import { crearGancho } from './gadgets/gancho';
import { iniciarPartida, type Mundo, type Partida } from './missions/partida';
import { crearCarmen } from './player/carmen';
import { crearControlador } from './player/controlador';
import {
  avisoPlayer,
  configurarDificultad,
  crearBotonPausa,
  dialogo,
  elegirDificultad,
  menuPausa,
  mostrarAvisoFan,
  mostrarTitulo,
} from './ui/pantallas';
import { crearCiudad, type Ciudad } from './world/ciudad';

const lienzo = document.getElementById('scene') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const escena = new THREE.Scene();
escena.background = new THREE.Color(0xff9e6b); // atardecer
escena.fog = new THREE.Fog(0xff9e6b, 40, 110);

const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 300);

escena.add(new THREE.HemisphereLight(0xffe2c4, 0x3a2a4a, 1.6));
const sol = new THREE.DirectionalLight(0xffffff, 1.8);
sol.position.set(30, 50, 20);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60 });
escena.add(sol);

// Colisiones y anclajes de la ciudad visible. El controlador y el gancho guardan
// estas mismas listas, así que al cambiar de ciudad se reemplaza su contenido.
const solidos: THREE.Box3[] = [];
const anclajes: THREE.Vector3[] = [];
let ciudad: Ciudad = crearCiudad();
escena.add(ciudad.grupo);
solidos.push(...ciudad.solidos);
anclajes.push(...ciudad.anclajes);

const carmen = crearCarmen();
carmen.modelo.position.copy(ciudad.inicio);
escena.add(carmen.modelo);

const entrada = crearEntrada(lienzo);
const gancho = crearGancho(escena, anclajes, solidos);
const controlador = crearControlador(carmen, camara, entrada, gancho, solidos, ciudad.inicio);
controlador.alCaer = () => avisoPlayer('¡Uy! Te llevo de vuelta a la azotea.');
controlador.alSaltar = () => sonar('salto');
gancho.alDisparar = () => sonar('gancho');

// Con ?prueba en la URL, las pruebas automáticas pueden leer el estado del juego.
if (new URLSearchParams(location.search).has('prueba')) {
  Object.assign(window, {
    juego: {
      posicion: controlador.posicion,
      gancho,
      teletransportar: (x: number, y: number, z: number) =>
        controlador.teletransportar(new THREE.Vector3(x, y, z)),
      puntos: () => partida?.puntosDeInteres().map((p) => p.toArray()) ?? [],
    },
  });
}

const progreso = cargarProgreso();

function aplicarAjustes(ajustes: Ajustes): void {
  configurarVoz(ajustes.voz);
  configurarSonido(ajustes.sonido);
  document.body.classList.toggle('crt', ajustes.efectoTv);
}
aplicarAjustes(progreso.ajustes);
if (progreso.dificultad) configurarDificultad(progreso.dificultad);

/** Elige entre [texto Detective, texto Aprendiz] según el nivel actual. */
function segunNivel([detective, aprendiz]: [string, string]): string {
  return progreso.dificultad === 'aprendiz' ? aprendiz : detective;
}

let jugando = false;
let pausado = false;
/** Hay una pantalla del caso encima (diálogo, mapa, Crime Net…). */
let bloqueado = false;
let partida: Partida | null = null;
let explicoControles = false;
let faltaExplicarControles = false;
let vioBienvenida = false;
let explicoGancho = false;
let momentoInicio = 0;
const botonGancho = document.querySelector<HTMLButtonElement>('.boton-gancho');

function ajustarTamano(): void {
  const { innerWidth: ancho, innerHeight: alto } = window;
  renderer.setSize(ancho, alto, false);
  camara.aspect = ancho / alto;
  camara.updateProjectionMatrix();
}
window.addEventListener('resize', ajustarTamano);
ajustarTamano();

const reloj = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = reloj.getDelta();
  const t = reloj.elapsedTime;
  if (jugando && !pausado) partida?.actualizar(dt, t);
  if (jugando && !pausado && !bloqueado) {
    controlador.actualizar(dt, t);
    botonGancho?.classList.toggle('sin-objetivo', !gancho.objetivo && !gancho.activo);
    // La primera vez que aparece el aro amarillo, Player explica el gancho.
    if (!explicoGancho && gancho.objetivo && t - momentoInicio > 8) {
      explicoGancho = true;
      avisoPlayer(
        segunNivel(
          esTactil()
            ? ['¿Ves el aro amarillo? Toca «Gancho» para volar hasta allá.', '¡Mira el aro amarillo! Toca Gancho.']
            : ['¿Ves el aro amarillo? Presiona G para volar hasta allá con tu gancho.', '¡Mira el aro amarillo! Aprieta la G.'],
        ),
        6,
      );
    }
  } else if (!jugando) {
    // Cámara orbitando a Carmen, como en la intro de un caso.
    const foco = carmen.modelo.position;
    camara.position.set(foco.x + Math.sin(t * 0.2) * 9, foco.y + 4.5, foco.z + Math.cos(t * 0.2) * 9);
    camara.lookAt(foco.x, foco.y + 2.2, foco.z);
    carmen.animar(t, 0);
  }
  entrada.finCuadro();
  ciudad.animar(t);
  renderer.render(escena, camara);
});

mostrarAvisoFan();

function bienvenida(): void {
  vioBienvenida = true;
  dialogo(
    [
      {
        quien: 'player',
        texto: '¡Hola, Red! Soy Player. Te hablo por tus aretes.',
        aprendiz: '¡Hola, Red! Soy Player.',
      },
      {
        quien: 'player',
        texto: 'V.I.L.E. quiere robar un tesoro muy valioso.',
        aprendiz: 'V.I.L.E. quiere robar un tesoro.',
      },
      {
        quien: 'carmen',
        texto: 'Entonces se lo quitaremos y lo devolveremos a su dueño.',
        aprendiz: '¡Y yo lo voy a devolver!',
      },
      {
        quien: 'zack',
        texto: 'Ivy y yo te esperamos en el auto, ¡listos para viajar!',
        aprendiz: '¡Te esperamos en el auto!',
      },
      {
        quien: 'ivy',
        texto: 'Y revisé tu gancho. ¡Quedó como nuevo!',
        aprendiz: '¡Tu gancho está listo!',
      },
      {
        quien: 'player',
        texto: '¡Tenemos una misión! Te cuento todo al llegar.',
        aprendiz: '¡Tenemos una misión!',
      },
    ],
    jugar,
  );
}

const mundo: Mundo = {
  escena,
  posicionCarmen: controlador.posicion,
  cambiarCiudad(nueva, cielo) {
    escena.remove(ciudad.grupo);
    ciudad = nueva;
    escena.add(ciudad.grupo);
    solidos.splice(0, solidos.length, ...ciudad.solidos);
    anclajes.splice(0, anclajes.length, ...ciudad.anclajes);
    (escena.background as THREE.Color).setHex(cielo);
    escena.fog?.color.setHex(cielo);
    controlador.teletransportar(ciudad.inicio);
  },
  bloquear(valor) {
    bloqueado = valor;
    document.body.classList.toggle('bloqueado', valor);
    entrada.activar(!valor && jugando && !pausado);
    if (!valor) reloj.getDelta(); // descartar el tiempo que estuvo bloqueado
    if (!valor && faltaExplicarControles) {
      faltaExplicarControles = false;
      explicoControles = true;
      momentoInicio = reloj.elapsedTime;
      explicarControles();
    }
  },
  nivel: () => progreso.dificultad ?? 'detective',
  alResolver(estrellas) {
    const id = CASO_GATO_DE_LA_SUERTE.id;
    const antes = progreso.casosResueltos.length;
    if (!progreso.casosResueltos.includes(id)) progreso.casosResueltos.push(id);
    progreso.estrellas[id] = Math.max(progreso.estrellas[id] ?? 0, estrellas);
    guardarProgreso(progreso);
    return { antes, despues: progreso.casosResueltos.length };
  },
  alSalir: salirAlTitulo,
};

function salirAlTitulo(): void {
  partida?.terminar();
  partida = null;
  jugando = false;
  bloqueado = false;
  document.body.classList.remove('jugando', 'bloqueado');
  entrada.activar(false);
  mostrarTitulo(empezar);
}

function explicarControles(): void {
  avisoPlayer(
    segunNivel(
      esTactil()
        ? ['Usa el círculo para caminar y el botón para saltar. Desliza el dedo para mirar.', 'Mueve el círculo para caminar. ¡Toca Saltar!']
        : ['Camina con las flechas y salta con espacio. Arrastra el mouse para mirar.', 'Camina con las flechas. ¡Salta con espacio!'],
    ),
    7,
  );
}

function jugar(): void {
  jugando = true;
  momentoInicio = reloj.elapsedTime;
  document.body.classList.add('jugando');
  faltaExplicarControles = !explicoControles;
  // La partida abre su diálogo de inicio; al cerrarlo, Carmen puede moverse.
  partida = iniciarPartida(CASO_GATO_DE_LA_SUERTE, mundo);
}

function pausar(): void {
  if (!jugando || pausado || bloqueado) return;
  pausado = true;
  document.body.classList.add('pausado');
  entrada.activar(false);
  menuPausa({
    ajustes: progreso.ajustes,
    dificultad: progreso.dificultad ?? 'detective',
    alCambiarAjustes(ajustes) {
      progreso.ajustes = ajustes;
      aplicarAjustes(ajustes);
      guardarProgreso(progreso);
    },
    alCambiarDificultad(dificultad) {
      progreso.dificultad = dificultad;
      configurarDificultad(dificultad);
      guardarProgreso(progreso);
    },
    alSeguir: reanudar,
    alSalir() {
      reanudar();
      salirAlTitulo();
    },
  });
}

function reanudar(): void {
  pausado = false;
  document.body.classList.remove('pausado');
  entrada.activar(true);
  reloj.getDelta(); // descartar el tiempo que estuvo en pausa
  // Que el espacio (saltar) no vuelva a apretar el último botón tocado.
  (document.activeElement as HTMLElement | null)?.blur();
}

crearBotonPausa(pausar);
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Escape' || !jugando) return;
  if (pausado) {
    document.querySelector<HTMLButtonElement>('.boton-seguir')?.click();
  } else {
    pausar();
  }
});

function empezar(): void {
  const seguir = () => (vioBienvenida ? jugar() : bienvenida());
  if (progreso.dificultad) {
    seguir();
    return;
  }
  elegirDificultad((dificultad) => {
    progreso.dificultad = dificultad;
    configurarDificultad(dificultad);
    guardarProgreso(progreso);
    seguir();
  });
}

mostrarTitulo(empezar);
