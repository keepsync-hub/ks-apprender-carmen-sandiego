import * as THREE from 'three';

// Barrio de azoteas de bloques. Por ahora es decorado para la pantalla de título;
// en el hito 2 se convierte en el primer mapa jugable.

const COLORES_EDIFICIO = [0xf2c14e, 0x5b8e7d, 0xf78154, 0x4d9de0, 0xe15554, 0x7768ae, 0x3bb273];

/** Generador pseudoaleatorio con semilla: la ciudad siempre sale igual. */
function azar(semilla: number): () => number {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface Ciudad {
  grupo: THREE.Group;
  /** Puntos rojos donde se puede enganchar el gancho de Carmen. */
  anclajes: THREE.Mesh[];
  /** Altura de la azotea donde está parada Carmen. */
  alturaInicio: number;
  animar(tiempo: number): void;
}

export function crearCiudad(): Ciudad {
  const grupo = new THREE.Group();
  const anclajes: THREE.Mesh[] = [];
  const r = azar(1985);

  const suelo = new THREE.Mesh(
    new THREE.BoxGeometry(200, 1, 200),
    new THREE.MeshLambertMaterial({ color: 0x3a3a46 }),
  );
  suelo.position.y = -0.5;
  suelo.receiveShadow = true;
  grupo.add(suelo);

  const materialVentana = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
  const geoAnclaje = new THREE.OctahedronGeometry(0.4);
  const matAnclaje = new THREE.MeshBasicMaterial({ color: 0xff2d3a });

  const alturaInicio = 8;

  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      // Calles cada tres manzanas.
      if (x % 3 === 0 || z % 3 === 0) continue;
      const esInicio = x === 1 && z === 1;
      const alto = esInicio ? alturaInicio : 4 + Math.floor(r() * 14);
      const ancho = 5 + r() * 2;
      const color = COLORES_EDIFICIO[Math.floor(r() * COLORES_EDIFICIO.length)];

      const edificio = new THREE.Mesh(
        new THREE.BoxGeometry(ancho, alto, ancho),
        new THREE.MeshLambertMaterial({ color }),
      );
      edificio.position.set(x * 8, alto / 2, z * 8);
      edificio.castShadow = true;
      edificio.receiveShadow = true;
      grupo.add(edificio);

      // Ventanas como pequeños bloques luminosos en la fachada frontal.
      for (let piso = 2; piso < alto - 1; piso += 2.5) {
        for (const dx of [-ancho / 4, ancho / 4]) {
          if (r() < 0.35) continue;
          const ventana = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.1), materialVentana);
          ventana.position.set(x * 8 + dx, piso, z * 8 + ancho / 2 + 0.05);
          grupo.add(ventana);
        }
      }

      // Algunas azoteas tienen un poste con punto de anclaje para el gancho.
      if (!esInicio && r() < 0.3) {
        const poste = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 2, 0.25),
          new THREE.MeshLambertMaterial({ color: 0x222222 }),
        );
        poste.position.set(x * 8, alto + 1, z * 8);
        const anclaje = new THREE.Mesh(geoAnclaje, matAnclaje);
        anclaje.position.set(x * 8, alto + 2.4, z * 8);
        grupo.add(poste, anclaje);
        anclajes.push(anclaje);
      }
    }
  }

  return {
    grupo,
    anclajes,
    alturaInicio,
    animar(tiempo) {
      for (const [i, a] of anclajes.entries()) {
        a.rotation.y = tiempo * 2 + i;
        a.scale.setScalar(1 + Math.sin(tiempo * 4 + i) * 0.15);
      }
    },
  };
}
