import * as THREE from 'three';

// Estilo Roblox: plástico liso de colores vivos, «studs» (los botoncitos de las
// piezas de construcción) en el suelo y las azoteas, y cabezas cilíndricas con la
// carita sonriente clásica. Todo se dibuja en canvas: sin imágenes externas.

/** Tamaño de un stud en unidades del mundo. */
export const STUD = 0.8;

/** Material de plástico liso, como las piezas de Roblox. */
export function plastico(color: number, mapa: THREE.Texture | null = null): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, map: mapa, roughness: 0.55, metalness: 0 });
}

const hayCanvas = typeof document !== 'undefined';

function lienzo(ancho: number, alto: number, dibujar: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext('2d');
  if (ctx) dibujar(ctx);
  const textura = new THREE.CanvasTexture(c);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  return textura;
}

let baseStuds: THREE.CanvasTexture | null = null;

/**
 * Textura de studs que se repite: claros por arriba, sombra abajo. Es gris claro para
 * que el color del material se vea casi igual. `ancho`/`fondo` en unidades del mundo.
 * En las pruebas (sin `document`) devuelve null y la pieza queda lisa.
 */
export function texturaStuds(ancho: number, fondo: number): THREE.Texture | null {
  if (!hayCanvas) return null;
  baseStuds ??= lienzo(64, 64, (ctx) => {
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(0, 0, 64, 64);
    // Sombra del stud.
    ctx.fillStyle = '#b4b4b4';
    ctx.beginPath();
    ctx.arc(34, 35, 19, 0, Math.PI * 2);
    ctx.fill();
    // Cara superior.
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath();
    ctx.arc(31, 31, 18, 0, Math.PI * 2);
    ctx.fill();
    // Brillo.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(31, 31, 13, Math.PI * 1.05, Math.PI * 1.6);
    ctx.stroke();
    // Junta entre piezas.
    ctx.strokeStyle = '#d2d2d2';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 64, 64);
  });
  const textura = baseStuds.clone();
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(Math.max(1, Math.round(ancho / STUD)), Math.max(1, Math.round(fondo / STUD)));
  return textura;
}

let cara: THREE.CanvasTexture | null = null;

/**
 * La carita clásica de Roblox (dos ojos ovalados y una sonrisa) para envolver un
 * cilindro: el centro del lienzo queda al frente de la cabeza.
 */
export function texturaCara(): THREE.Texture | null {
  if (!hayCanvas) return null;
  cara ??= lienzo(256, 128, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#111111';
    for (const x of [113, 143]) {
      ctx.beginPath();
      ctx.ellipse(x, 50, 4, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 60, 20, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  });
  return cara;
}

/**
 * Cabeza cilíndrica de Roblox con cara. Mide 0.84 de ancho y 0.72 de alto;
 * `y` es su centro.
 */
export function cabezaRoblox(piel: number, y: number): THREE.Mesh {
  // thetaStart = -π deja la mitad de la textura (la cara) mirando hacia +z.
  const geometria = new THREE.CylinderGeometry(0.42, 0.42, 0.72, 28, 1, false, -Math.PI);
  const cabeza = new THREE.Mesh(geometria, [plastico(piel, texturaCara()), plastico(piel), plastico(piel)]);
  cabeza.position.y = y;
  cabeza.castShadow = true;
  return cabeza;
}

/** Libera geometrías, materiales y texturas propias de un grupo. */
export function liberarGrupo(grupo: THREE.Object3D): void {
  grupo.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.geometry.dispose();
    const materiales: THREE.Material[] = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of materiales) {
      // La cara es compartida por todos los personajes: no se libera.
      if (m instanceof THREE.MeshStandardMaterial && m.map && m.map !== cara) m.map.dispose();
      m.dispose();
    }
  });
}
