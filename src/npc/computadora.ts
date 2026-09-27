import * as THREE from 'three';
import { crearMarca, type Personaje } from './personaje';

// Computadora de V.I.L.E. sobre una azotea: escritorio, monitor de los 90 con
// pantalla verde parpadeante y un letrero rojo. Se hackea con el labial.

function caja(ancho: number, alto: number, fondo: number, material: THREE.Material): THREE.Mesh {
  const malla = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, fondo), material);
  malla.castShadow = true;
  return malla;
}

export function crearComputadora(): Personaje {
  const modelo = new THREE.Group();
  const gris = new THREE.MeshLambertMaterial({ color: 0x55555f });
  const beige = new THREE.MeshLambertMaterial({ color: 0xd9d0b8 });
  const pantalla = new THREE.MeshBasicMaterial({ color: 0x39ff14 });

  const escritorio = caja(1.8, 1.1, 1, gris);
  escritorio.position.y = 0.55;
  const monitor = caja(1.3, 1, 0.9, beige);
  monitor.position.set(0, 1.6, -0.05);
  const vidrio = caja(1.05, 0.75, 0.02, pantalla);
  vidrio.position.set(0, 1.62, 0.41);
  const teclado = caja(1.1, 0.08, 0.35, beige);
  teclado.position.set(0, 1.14, 0.3);
  const letrero = caja(1, 0.35, 0.08, new THREE.MeshLambertMaterial({ color: 0xd6202b }));
  letrero.position.set(0, 2.45, -0.1);
  modelo.add(escritorio, monitor, vidrio, teclado, letrero);

  const marca = crearMarca(3);
  modelo.add(marca.grupo);

  return {
    modelo,
    marcar: marca.mostrar,
    animar(tiempo) {
      marca.animar(tiempo);
      // Parpadeo de pantalla antigua.
      pantalla.color.setHex(Math.sin(tiempo * 6) > 0.6 ? 0x1f8f0a : 0x39ff14);
    },
  };
}
