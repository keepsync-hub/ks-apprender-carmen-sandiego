import * as THREE from 'three';
import type { Dificultad } from '../core/guardado';
import { sonar } from '../core/sonido';
import { CIUDADES } from '../data/ciudades';
import { OPERATIVOS } from '../data/operativos';
import type { Caso, IdCiudad } from '../data/tipos';
import { largoSegunNivel } from '../gadgets/labial';
import { crearComputadora } from '../npc/computadora';
import { crearPersonaje, type Personaje } from '../npc/personaje';
import { mostrarLibreta, mostrarResultado } from '../ui/caso-ui';
import { mostrarCrimeNet } from '../ui/crimenet';
import { mostrarHackeo } from '../ui/hackeo';
import { mostrarMapa } from '../ui/mapa';
import { mostrarPalabra, type OpcionesPalabra } from '../ui/palabra-ui';
import { avisoPlayer, dialogo, elemento, type Linea } from '../ui/pantallas';
import { crearCiudad, semillaDe, type Ciudad } from '../world/ciudad';
import { EstadoCaso, rango } from './caso';
import { lugaresTestigos, rutaDeHuida } from './lugares';
import { elegirPalabra, type Vocabulario } from './palabras';

// Orquesta un caso completo: carga cada ciudad, ubica testigos y ladrón en las
// azoteas, detecta cuando Carmen se acerca y encadena mapa, Crime Net y final.

/** Lo que la partida necesita del resto del juego. */
export interface Mundo {
  escena: THREE.Scene;
  /** Pies de Carmen (se lee cada cuadro). */
  posicionCarmen: THREE.Vector3;
  /** Reemplaza la ciudad visible (colisiones, anclajes y cielo) y lleva a Carmen al inicio. */
  cambiarCiudad(ciudad: Ciudad, cielo: number): void;
  /** true detiene a Carmen mientras hay una pantalla encima (diálogo, mapa…). */
  bloquear(bloqueado: boolean): void;
  nivel: () => Dificultad;
  /** Se llama al resolver el caso con las estrellas; devuelve casos resueltos antes y después. */
  alResolver(casoId: string, estrellas: number): { antes: number; despues: number };
  /** Palabras en inglés aprendidas, con su dominio. */
  vocabulario(): Vocabulario;
  /** Guarda la respuesta a «aprende una palabra». */
  alResponderPalabra(id: string, alPrimerIntento: boolean): void;
  alSalir(): void;
}

const DISTANCIA_HABLAR = 2.6;
const DISTANCIA_HUIDA = 7;
const DISTANCIA_ATRAPAR = 2.8;
const DURACION_SALTO_LADRON = 1.1;
/** Qué tan hondo se hunde El Topo en el techo al cavar. */
const PROFUNDIDAD_TUNEL = 4.5;

interface TestigoEnMundo {
  personaje: Personaje;
  indice: number;
}

export interface Partida {
  actualizar(dt: number, tiempo: number): void;
  terminar(): void;
  /** Testigos que faltan por escuchar, o el ladrón en la ciudad final. */
  puntosDeInteres(): THREE.Vector3[];
}

export function iniciarPartida(caso: Caso, mundo: Mundo): Partida {
  const estado = new EstadoCaso(caso, mundo.nivel());
  const segun = (linea: Omit<Linea, 'aprendiz'> & { aprendiz: string }) => linea;
  let ciudad: Ciudad | null = null;
  let testigos: TestigoEnMundo[] = [];
  let enPantalla = false;
  /** Computadoras que se dejaron a medio hackear: no se reabren hasta que Carmen se aleje. */
  const enfriando = new Set<number>();
  let terminada = false;

  // --- Ladrón en la ciudad final
  let ladron: Personaje | null = null;
  let rutaLadron: THREE.Vector3[] = [];
  let etapaLadron = 0;
  let salto: { desde: THREE.Vector3; hasta: THREE.Vector3; t: number } | null = null;
  let atrapado = false;
  /** Palabras en inglés que salieron en este caso, para la pantalla final. */
  const palabrasDelCaso: string[] = [];

  const botonLibreta = elemento('button', 'boton boton-libreta', '📒');
  botonLibreta.ariaLabel = 'Libreta de pistas';
  botonLibreta.addEventListener('click', () => {
    sonar('clic');
    abrirPantalla();
    mostrarLibreta(estado, cerrarPantalla);
  });
  document.body.append(botonLibreta);

  function abrirPantalla(): void {
    enPantalla = true;
    mundo.bloquear(true);
  }

  function cerrarPantalla(): void {
    enPantalla = false;
    mundo.bloquear(false);
  }

  function quitarPersonajes(): void {
    for (const t of testigos) mundo.escena.remove(t.personaje.modelo);
    testigos = [];
    if (ladron) mundo.escena.remove(ladron.modelo);
    ladron = null;
  }

  function mirarHacia(modelo: THREE.Object3D, punto: THREE.Vector3): void {
    modelo.rotation.y = Math.atan2(punto.x - modelo.position.x, punto.z - modelo.position.z);
  }

  function cargarCiudad(id: IdCiudad): void {
    quitarPersonajes();
    ciudad?.liberar();
    const datos = CIUDADES[id];
    ciudad = crearCiudad(datos.tema, semillaDe(id));
    mundo.cambiarCiudad(ciudad, datos.tema.cielo);

    if (estado.enFinal) {
      prepararLadron(ciudad);
      return;
    }
    const actuales = estado.testigosActuales();
    enfriando.clear();
    const lugares = lugaresTestigos(ciudad, actuales.length);
    testigos = actuales.map((t, indice) => {
      const personaje =
        t.tipo === 'computadora'
          ? crearComputadora()
          : // Testigos con los colores del «noob» clásico de Roblox: amarillo y verde.
            crearPersonaje({ ropa: t.color, piel: 0xf5cd30, brazos: 0xf5cd30, piernas: 0xa4bd47, accesorio: 'gorra' });
      personaje.modelo.position.copy(lugares[indice]);
      mirarHacia(personaje.modelo, ciudad!.inicio);
      mundo.escena.add(personaje.modelo);
      return { personaje, indice };
    });
  }

  function prepararLadron(c: Ciudad): void {
    const op = OPERATIVOS[caso.ladron];
    atrapado = false;
    etapaLadron = 0;
    salto = null;
    rutaLadron = rutaDeHuida(c);
    ladron = crearPersonaje({ ropa: op.color, accesorio: op.accesorio });
    // El tesoro dorado en sus manos.
    const tesoro = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xffc629, emissive: 0x553300, roughness: 0.3, metalness: 0.4 }),
    );
    tesoro.position.set(0, 1.9, 0.5);
    ladron.modelo.add(tesoro);
    // El «!» ayuda a encontrarlo cuando reaparece en otra azotea.
    ladron.marcar(true);
    ladron.modelo.position.copy(rutaLadron[0]);
    mirarHacia(ladron.modelo, c.inicio);
    mundo.escena.add(ladron.modelo);
  }

  function hablarConTestigo(t: TestigoEnMundo): void {
    abrirPantalla();
    const datos = estado.testigosActuales()[t.indice];
    if (datos.tipo !== 'computadora') {
      // Como en Aprender Jugando 3D: para recibir la pista, primero se aprende una palabra.
      aprenderPalabra(
        {
          quien: 'testigo',
          nombre: datos.nombre,
          motivo: {
            texto: '¡Te cuento lo que vi! Pero antes, aprende una palabra en inglés.',
            aprendiz: '¡Te doy mi pista! Primero, una palabra.',
          },
        },
        () => mostrarPista(t),
      );
      return;
    }
    // Computadora de V.I.L.E.: primero hay que hackearla con el labial.
    const aprendiz = mundo.nivel() === 'aprendiz';
    mostrarHackeo({
      largo: largoSegunNivel(mundo.nivel()),
      msPorPaso: aprendiz ? 750 : 550,
      alLograrlo: () => mostrarPista(t),
      alSalir: () => {
        enfriando.add(t.indice);
        cerrarPantalla();
        avisoPlayer(aprendiz ? 'Vuelve cuando quieras.' : 'Puedes volver a hackearla cuando quieras.', 3);
      },
    });
  }

  /** Enseña la siguiente palabra en inglés y sigue con `despues` al acertar. */
  function aprenderPalabra(
    quien: Pick<OpcionesPalabra, 'quien' | 'nombre' | 'motivo'>,
    despues: () => void,
  ): void {
    const palabra = elegirPalabra(mundo.vocabulario(), palabrasDelCaso);
    if (!palabrasDelCaso.includes(palabra.id)) palabrasDelCaso.push(palabra.id);
    mostrarPalabra({
      ...quien,
      palabra,
      nivel: mundo.nivel(),
      alTerminar(alPrimerIntento) {
        mundo.alResponderPalabra(palabra.id, alPrimerIntento);
        despues();
      },
    });
  }

  function mostrarPista(t: TestigoEnMundo): void {
    const datos = estado.testigosActuales()[t.indice];
    const pista = estado.hablarCon(t.indice);
    t.personaje.marcar(false);
    const quien = datos.tipo === 'computadora' ? 'computadora' : 'testigo';
    dialogo(
      [{ quien, nombre: datos.nombre, texto: pista.texto, aprendiz: pista.aprendiz, imagen: pista.imagen }],
      () => {
        cerrarPantalla();
        if (estado.pistasCompletas) prepararViaje();
        else {
          const faltan = testigos.filter((x) => !estado.yaHablo(x.indice)).length;
          avisoPlayer(
            mundo.nivel() === 'aprendiz'
              ? `¡Bien! Faltan ${faltan}.`
              : `¡Buena pista! Te ${faltan === 1 ? 'falta 1 pista' : `faltan ${faltan} pistas`}.`,
            3,
          );
        }
      },
      '¡Anotado!',
    );
  }

  function prepararViaje(): void {
    abrirPantalla();
    const identificar = estado.debeIdentificarAntesDeViajar;
    dialogo(
      [
        segun({
          quien: 'player',
          texto: '¡Ya tenemos todas las pistas de esta ciudad! Zack nos espera en el avión.',
          aprendiz: '¡Listo! Vamos al avión.',
        }),
        ...(identificar
          ? [
              segun({
                quien: 'player',
                texto: 'Antes de viajar, usemos la Crime Net para saber quién es el ladrón.',
                aprendiz: 'Primero: ¿quién es el ladrón?',
              }),
            ]
          : []),
      ],
      () => (identificar ? mostrarCrimeNet(estado, abrirMapa) : abrirMapa()),
    );
  }

  function abrirMapa(): void {
    const origen = estado.ciudadActual;
    const pistasDestino = estado.pistas
      .slice(-estado.testigosActuales().length)
      .filter((p) => !p.rasgo)
      .map((p) => p.imagen);
    mostrarMapa({
      origen,
      opciones: estado.opcionesDestino(),
      aprendiz: mundo.nivel() === 'aprendiz',
      pistas: pistasDestino,
      ayuda:
        mundo.nivel() === 'aprendiz'
          ? '¡Uy! Mira la bandera otra vez.'
          : 'Hmm, ese lugar no calza con las pistas. Mira la bandera y los dibujos.',
      alElegir: (destino) => estado.elegirDestino(destino),
      alLlegar: (destino) => {
        cargarCiudad(destino);
        cerrarPantalla();
        const nombre = CIUDADES[destino].nombre;
        if (estado.enFinal) {
          abrirPantalla();
          const op = OPERATIVOS[caso.ladron];
          dialogo(
            [
              segun({
                quien: 'player',
                texto: `¡${op.nombre} está en las azoteas de ${nombre}! Acércate para atraparlo.`,
                aprendiz: '¡Ahí está! ¡Atrápalo!',
              }),
            ],
            cerrarPantalla,
          );
        } else {
          avisoPlayer(
            mundo.nivel() === 'aprendiz'
              ? `¡Llegamos a ${nombre}!`
              : `¡Llegamos a ${nombre}! Busca el «!» amarillo.`,
            4,
          );
        }
      },
    });
  }

  function atrapar(): void {
    atrapado = true;
    sonar('fanfarria');
    // Red de Ivy: una caja de alambre roja que cae sobre el ladrón.
    const red = new THREE.Mesh(
      new THREE.BoxGeometry(2, 4, 2),
      new THREE.MeshBasicMaterial({ color: 0xd6202b, wireframe: true }),
    );
    red.position.y = 2;
    ladron?.modelo.add(red);
    abrirPantalla();
    const op = OPERATIVOS[caso.ladron];
    dialogo(
      [
        segun({
          quien: 'carmen',
          texto: `¡Te atrapé, ${op.nombre}! ${caso.tesoro[0].toUpperCase()}${caso.tesoro.slice(1)} vuelve a su dueño.`,
          aprendiz: '¡Te atrapé!',
        }),
        segun({ quien: caso.ladron, ...caso.fraseLadron }),
      ],
      () =>
        // El tesoro está en un cofre con candado: la clave es una palabra en inglés.
        aprenderPalabra(
          {
            quien: 'player',
            nombre: 'Player',
            motivo: {
              texto: '¡El tesoro está en un cofre con candado! La clave es una palabra en inglés.',
              aprendiz: '¡El cofre tiene candado! La clave es una palabra.',
            },
          },
          entregarTesoro,
        ),
    );
  }

  function entregarTesoro(): void {
    dialogo(
      [
        segun({
          quien: 'carmen',
          texto: '¡Clic! El cofre se abrió. ¡Misión cumplida!',
          aprendiz: '¡Clic! ¡Se abrió!',
        }),
        segun({
          quien: 'chase',
          texto: '¡Alto ahí, Carmen Sandiego! ...¿Eh? Ya se fue. Solo dejó una tarjeta roja.',
          aprendiz: '¡Alto! ...¿Eh? ¡Ya se fue!',
        }),
        segun({
          quien: 'jefa',
          texto: 'Devuelvan el tesoro a su dueño. Y sigan buscando a Carmen Sandiego.',
          aprendiz: 'Devuelvan el tesoro a su dueño.',
        }),
      ],
      () => {
        const estrellas = estado.estrellas();
        const { antes, despues } = mundo.alResolver(caso.id, estrellas);
        mostrarResultado({
          estado,
          rango: rango(despues),
          subioDeRango: rango(antes) !== rango(despues),
          palabras: palabrasDelCaso,
          alTitulo: () => {
            terminar();
            mundo.alSalir();
          },
        });
      },
    );
  }

  function actualizarLadron(dt: number, tiempo: number): void {
    if (!ladron || atrapado) return;
    ladron.animar(tiempo);
    const carmen = mundo.posicionCarmen;
    if (salto) {
      salto.t = Math.min(1, salto.t + dt / DURACION_SALTO_LADRON);
      if (OPERATIVOS[caso.ladron].huida === 'excavar') {
        // Se hunde cavando en el techo y sale por otra azotea.
        const t = salto.t;
        if (t < 0.45) {
          ladron.modelo.position.copy(salto.desde);
          ladron.modelo.position.y -= (t / 0.45) * PROFUNDIDAD_TUNEL;
        } else if (t < 0.55) {
          ladron.modelo.visible = false;
        } else {
          ladron.modelo.visible = true;
          ladron.modelo.position.copy(salto.hasta);
          ladron.modelo.position.y -= (1 - (t - 0.55) / 0.45) * PROFUNDIDAD_TUNEL;
        }
      } else {
        ladron.modelo.position.lerpVectors(salto.desde, salto.hasta, salto.t);
        ladron.modelo.position.y += Math.sin(salto.t * Math.PI) * 6; // arco del salto
      }
      if (salto.t >= 1) {
        ladron.modelo.visible = true;
        ladron.modelo.position.copy(salto.hasta);
        salto = null;
        mirarHacia(ladron.modelo, carmen);
      }
      return;
    }
    const distancia = ladron.modelo.position.distanceTo(carmen);
    const ultima = etapaLadron >= rutaLadron.length - 1;
    if (ultima && distancia < DISTANCIA_ATRAPAR) {
      atrapar();
    } else if (!ultima && distancia < DISTANCIA_HUIDA) {
      etapaLadron++;
      salto = { desde: ladron.modelo.position.clone(), hasta: rutaLadron[etapaLadron], t: 0 };
      mirarHacia(ladron.modelo, rutaLadron[etapaLadron]);
      sonar('salto');
      const aprendiz = mundo.nivel() === 'aprendiz';
      const cava = OPERATIVOS[caso.ladron].huida === 'excavar';
      avisoPlayer(
        etapaLadron === 1
          ? cava
            ? aprendiz ? '¡Se metió en un túnel! Busca el «!».' : '¡Cavó un túnel! Busca el «!» y síguelo con tu gancho.'
            : aprendiz ? '¡Se escapa! ¡Usa tu gancho!' : '¡Se escapa! ¡Síguelo con tu gancho!'
          : aprendiz ? '¡Está cansado! ¡Ya casi!' : '¡Está cansado! ¡Una vez más y lo atrapas!',
        3,
      );
    }
  }

  function terminar(): void {
    if (terminada) return;
    terminada = true;
    quitarPersonajes();
    botonLibreta.remove();
  }

  // --- Inicio del caso
  cargarCiudad(estado.ciudadActual);
  abrirPantalla();
  const primera = CIUDADES[estado.ciudadActual].nombre;
  dialogo(
    [
      segun({
        quien: 'player',
        texto: `¡Red! Alguien de V.I.L.E. robó ${caso.tesoro} aquí, en ${primera}.`,
        aprendiz: `¡V.I.L.E. robó ${caso.tesoro}!`,
      }),
      segun({
        quien: 'player',
        texto: 'Busca el «!» amarillo: testigos que vieron algo y computadoras de V.I.L.E. para hackear.',
        aprendiz: 'Busca el «!» amarillo.',
      }),
      segun({ quien: 'carmen', texto: '¡Vamos a devolverlo a su dueño!', aprendiz: '¡A devolverlo!' }),
    ],
    cerrarPantalla,
  );

  return {
    actualizar(dt, tiempo) {
      if (terminada) return;
      for (const t of testigos) t.personaje.animar(tiempo);
      if (enPantalla) return;
      const carmen = mundo.posicionCarmen;
      for (const t of testigos) {
        if (estado.yaHablo(t.indice)) continue;
        const p = t.personaje.modelo.position;
        const cerca = Math.hypot(p.x - carmen.x, p.z - carmen.z) < DISTANCIA_HABLAR && Math.abs(p.y - carmen.y) < 2.5;
        if (enfriando.has(t.indice)) {
          if (Math.hypot(p.x - carmen.x, p.z - carmen.z) > DISTANCIA_HABLAR + 1.5) enfriando.delete(t.indice);
          continue;
        }
        if (cerca) {
          hablarConTestigo(t);
          return;
        }
      }
      actualizarLadron(dt, tiempo);
    },
    terminar,
    puntosDeInteres() {
      if (ladron) return [ladron.modelo.position];
      return testigos.filter((t) => !estado.yaHablo(t.indice)).map((t) => t.personaje.modelo.position);
    },
  };
}

