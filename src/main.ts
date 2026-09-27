import '@fontsource/press-start-2p/400.css';
import './style.css';
import * as THREE from 'three';
import { crearEntrada, esTactil } from './core/entrada';
import { cargarProgreso, guardarProgreso } from './core/guardado';
import { crearCarmen } from './player/carmen';
import { crearControlador } from './player/controlador';
import {
  avisoPlayer,
  dialogo,
  elegirDificultad,
  mostrarAvisoFan,
  mostrarTitulo,
} from './ui/pantallas';
import { crearCiudad } from './world/ciudad';

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

const ciudad = crearCiudad();
escena.add(ciudad.grupo);

const carmen = crearCarmen();
carmen.modelo.position.copy(ciudad.inicio);
escena.add(carmen.modelo);

const entrada = crearEntrada(lienzo);
const controlador = crearControlador(carmen, camara, entrada, ciudad.solidos, ciudad.inicio);
controlador.alCaer = () => avisoPlayer('¡Uy! Te llevo de vuelta a la azotea.');

let jugando = false;

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
  if (jugando) {
    controlador.actualizar(dt, t);
  } else {
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

document.body.classList.add('crt');
mostrarAvisoFan();

const progreso = cargarProgreso();

function bienvenida(): void {
  dialogo(
    [
      { quien: 'player', texto: '¡Hola, Red! Soy Player. Te hablo por tus aretes.' },
      { quien: 'player', texto: 'V.I.L.E. quiere robar un tesoro muy valioso.' },
      { quien: 'carmen', texto: 'Entonces se lo quitaremos y lo devolveremos a su dueño.' },
      { quien: 'player', texto: 'Primero, a entrenar. ¡Corre y salta por las azoteas!' },
    ],
    jugar,
  );
}

function jugar(): void {
  jugando = true;
  document.body.classList.add('jugando');
  entrada.activar(true);
  avisoPlayer(
    esTactil()
      ? 'Usa el círculo para caminar y el botón para saltar. Desliza el dedo para mirar.'
      : 'Camina con las flechas y salta con espacio. Arrastra el mouse para mirar.',
    7,
  );
}

function empezar(): void {
  if (progreso.dificultad) {
    bienvenida();
    return;
  }
  elegirDificultad((dificultad) => {
    progreso.dificultad = dificultad;
    guardarProgreso(progreso);
    bienvenida();
  });
}

mostrarTitulo(empezar);
