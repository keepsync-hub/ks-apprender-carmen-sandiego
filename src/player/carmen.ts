import * as THREE from 'three';

// Carmen hecha de bloques, al estilo Roblox: cada parte es una caja.
const COLORES = {
  gabardina: 0xd6202b,
  gabardinaOscura: 0xa3141d,
  piel: 0xc98b5e,
  pelo: 0x2b1a12,
  pantalon: 0x1c1c24,
  guantes: 0x111111,
  ojos: 0x111111,
};

function caja(ancho: number, alto: number, fondo: number, color: number): THREE.Mesh {
  const malla = new THREE.Mesh(
    new THREE.BoxGeometry(ancho, alto, fondo),
    new THREE.MeshLambertMaterial({ color }),
  );
  malla.castShadow = true;
  return malla;
}

export interface Carmen {
  modelo: THREE.Group;
  /**
   * Balanceo suave de brazos y piernas; `velocidad` 0 = quieta.
   * Con `colgando`, levanta el brazo derecho como si la tirara el gancho.
   */
  animar(tiempo: number, velocidad: number, colgando?: boolean): void;
}

export function crearCarmen(): Carmen {
  const modelo = new THREE.Group();

  const torso = caja(1, 1.1, 0.55, COLORES.gabardina);
  torso.position.y = 2.05;

  // Faldón de la gabardina, más ancho que el torso.
  const faldon = caja(1.1, 0.6, 0.65, COLORES.gabardinaOscura);
  faldon.position.y = 1.3;

  const cabeza = caja(0.75, 0.75, 0.75, COLORES.piel);
  cabeza.position.y = 3;

  const pelo = caja(0.8, 0.9, 0.3, COLORES.pelo);
  pelo.position.set(0, 2.9, -0.3);

  const ojoIzq = caja(0.1, 0.14, 0.02, COLORES.ojos);
  ojoIzq.position.set(-0.16, 3.05, 0.38);
  const ojoDer = ojoIzq.clone();
  ojoDer.position.x = 0.16;

  // Sombrero fedora: ala ancha + copa.
  const ala = caja(1.3, 0.08, 1.3, COLORES.gabardina);
  ala.position.y = 3.42;
  const copa = caja(0.8, 0.4, 0.8, COLORES.gabardina);
  copa.position.y = 3.65;
  const cinta = caja(0.82, 0.1, 0.82, COLORES.pantalon);
  cinta.position.y = 3.5;

  // Brazos y piernas cuelgan de un pivote en el hombro / cadera.
  const hombroIzq = new THREE.Group();
  hombroIzq.position.set(-0.7, 2.55, 0);
  const brazoIzq = caja(0.38, 1.05, 0.4, COLORES.gabardina);
  brazoIzq.position.y = -0.45;
  const guanteIzq = caja(0.36, 0.25, 0.38, COLORES.guantes);
  guanteIzq.position.y = -1.05;
  hombroIzq.add(brazoIzq, guanteIzq);

  const hombroDer = hombroIzq.clone();
  hombroDer.position.x = 0.7;

  const caderaIzq = new THREE.Group();
  caderaIzq.position.set(-0.25, 1.1, 0);
  const piernaIzq = caja(0.45, 1.1, 0.45, COLORES.pantalon);
  piernaIzq.position.y = -0.55;
  caderaIzq.add(piernaIzq);

  const caderaDer = caderaIzq.clone();
  caderaDer.position.x = 0.25;

  modelo.add(
    torso, faldon, cabeza, pelo, ojoIzq, ojoDer, ala, copa, cinta,
    hombroIzq, hombroDer, caderaIzq, caderaDer,
  );

  return {
    modelo,
    animar(tiempo, velocidad, colgando = false) {
      const paso = Math.sin(tiempo * 8) * 0.7 * Math.min(velocidad, 1);
      hombroIzq.rotation.x = paso;
      hombroDer.rotation.x = colgando ? -Math.PI * 0.85 : -paso;
      caderaIzq.rotation.x = -paso;
      caderaDer.rotation.x = paso;
      // Respiración cuando está quieta.
      torso.scale.y = 1 + Math.sin(tiempo * 2) * 0.015;
    },
  };
}
