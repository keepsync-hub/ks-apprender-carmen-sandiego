import type { IdCiudad } from '../data/tipos';

// Banderas simplificadas dibujadas en SVG (30×20). Los emojis de bandera no se
// ven en Windows, y a esta edad importan los colores y formas principales.

const BANDERAS: Record<IdCiudad, string> = {
  // Estados Unidos: franjas rojas y blancas con cantón azul y estrellas.
  'san-francisco': `
    <rect width="30" height="20" fill="#fff"/>
    ${[0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${(i * 20) / 13}" width="30" height="${20 / 13}" fill="#b22234"/>`).join('')}
    <rect width="13" height="10.8" fill="#3c3b6e"/>
    ${[2, 5, 8, 11].flatMap((x) => [2.5, 5.4, 8.3].map((y) => `<circle cx="${x}" cy="${y}" r="0.7" fill="#fff"/>`)).join('')}`,
  // México: verde, blanco y rojo con el escudo (simplificado) al centro.
  'ciudad-de-mexico': `
    <rect width="10" height="20" fill="#006847"/>
    <rect x="10" width="10" height="20" fill="#fff"/>
    <rect x="20" width="10" height="20" fill="#ce1126"/>
    <circle cx="15" cy="10" r="2.6" fill="#8c5a2b"/>
    <path d="M12.6 11.6 Q15 14.2 17.4 11.6" stroke="#2e7d32" stroke-width="0.7" fill="none"/>`,
  // Argentina: celeste, blanco y celeste con el Sol de Mayo.
  'buenos-aires': `
    <rect width="30" height="20" fill="#74acdf"/>
    <rect y="6.67" width="30" height="6.67" fill="#fff"/>
    <circle cx="15" cy="10" r="2.2" fill="#f6b40e"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="14.7" y="6.4" width="0.6" height="1.4" fill="#f6b40e" transform="rotate(${a} 15 10)"/>`).join('')}`,
  // Perú: rojo, blanco y rojo.
  lima: `
    <rect width="10" height="20" fill="#d91023"/>
    <rect x="10" width="10" height="20" fill="#fff"/>
    <rect x="20" width="10" height="20" fill="#d91023"/>`,
  // Japón: círculo rojo sobre blanco.
  tokio: `
    <rect width="30" height="20" fill="#fff"/>
    <circle cx="15" cy="10" r="6" fill="#bc002d"/>`,
  // Chile: cantón azul con estrella blanca, blanco arriba y rojo abajo.
  santiago: `
    <rect width="30" height="10" fill="#fff"/>
    <rect y="10" width="30" height="10" fill="#d52b1e"/>
    <rect width="10" height="10" fill="#0039a6"/>
    <polygon points="5,2 5.9,4.6 8.6,4.6 6.4,6.2 7.2,8.8 5,7.2 2.8,8.8 3.6,6.2 1.4,4.6 4.1,4.6" fill="#fff"/>`,
  // Ecuador: amarillo (la mitad de arriba), azul y rojo, con el escudo al centro.
  quito: `
    <rect width="30" height="10" fill="#ffdd00"/>
    <rect y="10" width="30" height="5" fill="#034ea2"/>
    <rect y="15" width="30" height="5" fill="#ed1c24"/>
    <ellipse cx="15" cy="10" rx="2.4" ry="3" fill="#6ec6ff" stroke="#8c5a2b" stroke-width="0.6"/>`,
  // Brasil: verde con rombo amarillo y círculo azul.
  'rio-de-janeiro': `
    <rect width="30" height="20" fill="#009c3b"/>
    <polygon points="15,2 28,10 15,18 2,10" fill="#ffdf00"/>
    <circle cx="15" cy="10" r="4.2" fill="#002776"/>`,
};

export function banderaSvg(ciudad: IdCiudad): string {
  return `<svg class="bandera" viewBox="0 0 30 20" role="img" aria-hidden="true">${BANDERAS[ciudad]}</svg>`;
}

/**
 * Convierte la imagen de una pista en un elemento: emoji, `bandera:<id>` o
 * `color:#rrggbb` (muestra de color).
 */
export function imagenPista(imagen: string): HTMLElement {
  const contenedor = document.createElement('span');
  contenedor.className = 'imagen-pista';
  if (imagen.startsWith('bandera:')) {
    contenedor.innerHTML = banderaSvg(imagen.slice('bandera:'.length) as IdCiudad);
  } else if (imagen.startsWith('color:')) {
    const muestra = document.createElement('span');
    muestra.className = 'muestra-color';
    muestra.style.background = imagen.slice('color:'.length);
    contenedor.append(muestra);
  } else {
    contenedor.textContent = imagen;
  }
  return contenedor;
}
