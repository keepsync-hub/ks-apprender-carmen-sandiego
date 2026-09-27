import * as THREE from 'three';

// Personajes de bloques para testigos y operativos de V.I.L.E.

function caja(ancho: number, alto: number, fondo: number, color: number): THREE.Mesh {
  const malla = new THREE.Mesh(
    new THREE.BoxGeometry(ancho, alto, fondo),
    new THREE.MeshLambertMaterial({ color }),
  );
  malla.castShadow = true;
  return malla;
}

export interface OpcionesPersonaje {
  ropa: number;
  piel?: number;
  pelo?: number;
  /** Accesorio en la cabeza. */
  accesorio?: 'gorra' | 'cuernos' | 'casco' | 'ninguno';
}

export interface Personaje {
  modelo: THREE.Group;
  /** Muestra u oculta el «!» amarillo de «tengo algo que contarte». */
  marcar(visible: boolean): void;
  animar(tiempo: number): void;
}

export function crearPersonaje(opciones: OpcionesPersonaje): Personaje {
  const { ropa, piel = 0xd9a47a, pelo = 0x2b1a12, accesorio = 'ninguno' } = opciones;
  const modelo = new THREE.Group();

  const cuerpo = new THREE.Group();
  const torso = caja(1, 1.3, 0.55, ropa);
  torso.position.y = 1.85;
  const cabeza = caja(0.75, 0.75, 0.75, piel);
  cabeza.position.y = 2.9;
  const cabello = caja(0.8, 0.25, 0.8, pelo);
  cabello.position.y = 3.3;
  const ojoIzq = caja(0.1, 0.14, 0.02, 0x111111);
  ojoIzq.position.set(-0.16, 2.95, 0.38);
  const ojoDer = ojoIzq.clone();
  ojoDer.position.x = 0.16;
  const piernaIzq = caja(0.45, 1.2, 0.45, 0x2a2a3a);
  piernaIzq.position.set(-0.25, 0.6, 0);
  const piernaDer = piernaIzq.clone();
  piernaDer.position.x = 0.25;
  const brazoIzq = caja(0.38, 1.2, 0.4, ropa);
  brazoIzq.position.set(-0.7, 1.9, 0);
  const brazoDer = brazoIzq.clone();
  brazoDer.position.x = 0.7;
  cuerpo.add(torso, cabeza, cabello, ojoIzq, ojoDer, piernaIzq, piernaDer, brazoIzq, brazoDer);

  if (accesorio === 'gorra') {
    const gorra = caja(0.82, 0.2, 0.82, ropa);
    gorra.position.y = 3.4;
    const visera = caja(0.6, 0.08, 0.4, ropa);
    visera.position.set(0, 3.32, 0.55);
    cuerpo.add(gorra, visera);
  } else if (accesorio === 'casco') {
    // Casco de minero con lámpara, para El Topo.
    const casco = caja(0.9, 0.35, 0.9, 0x5a3a1a);
    casco.position.y = 3.4;
    const lampara = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.2, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffd23f }),
    );
    lampara.position.set(0, 3.42, 0.47);
    const lentes = caja(0.7, 0.16, 0.05, 0x111111);
    lentes.position.set(0, 2.98, 0.39);
    cuerpo.add(casco, lampara, lentes);
  } else if (accesorio === 'cuernos') {
    // Capucha con cuernos de cabra, para Le Chèvre.
    for (const lado of [-1, 1]) {
      const cuerno = caja(0.14, 0.5, 0.14, 0xe8e2d0);
      cuerno.position.set(lado * 0.25, 3.55, -0.1);
      cuerno.rotation.z = -lado * 0.35;
      cuerpo.add(cuerno);
    }
  }
  modelo.add(cuerpo);

  const marca = crearMarca(4.4);
  modelo.add(marca.grupo);

  return {
    modelo,
    marcar: marca.mostrar,
    animar(tiempo) {
      marca.animar(tiempo);
      cuerpo.position.y = Math.abs(Math.sin(tiempo * 2)) * 0.05;
    },
  };
}

/** «!» amarillo flotante que marca a quien tiene una pista. */
export function crearMarca(altura: number) {
  const grupo = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xffd23f });
  const palo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), material);
  palo.position.y = 0.55;
  const punto = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), material);
  grupo.add(palo, punto);
  grupo.position.y = altura;
  return {
    grupo,
    mostrar(visible: boolean) {
      grupo.visible = visible;
    },
    animar(tiempo: number) {
      grupo.position.y = altura + Math.sin(tiempo * 3) * 0.2;
      grupo.rotation.y = tiempo * 2;
    },
  };
}
