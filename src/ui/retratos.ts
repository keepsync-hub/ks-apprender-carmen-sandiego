// Retratos en pixel art de 16×16 dibujados en un canvas, como en los juegos de los 90.

type Paleta = Record<string, string>;

const PALETA: Paleta = {
  '.': '#000044',
  h: '#6b3e1f', // pelo castaño
  n: '#2b1a12', // pelo oscuro
  s: '#f0c08a', // piel clara
  t: '#c98b5e', // piel morena
  e: '#111111', // ojos
  m: '#a0404a', // boca
  a: '#9a9a9a', // audífonos
  g: '#3bb273', // polerón verde
  r: '#d6202b', // rojo Carmen
  k: '#8a0e16', // rojo oscuro
};

const PLAYER = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '...hhssssssah...',
  '..aahsesseshaa..',
  '..aassssssssaa..',
  '..aassssssssaa..',
  '...assmmmmssa...',
  '....ssssssss....',
  '.....ssssss.....',
  '....gggggggg....',
  '...gggggggggg...',
  '..gggggggggggg..',
  '..gggggggggggg..',
  '..gggggggggggg..',
];

const CARMEN = [
  '................',
  '.....rrrrrr.....',
  '....rrrrrrrr....',
  '..rrrrrrrrrrrr..',
  '..kkkkkkkkkkkk..',
  '...nnttttttnn...',
  '...ntetttettn...',
  '...nttttttttn...',
  '...ntttmmtttn...',
  '...nnttttttnn...',
  '....nnttttnn....',
  '....rrrrrrrr....',
  '...rrrkrrkrrr...',
  '..rrrrkrrkrrrr..',
  '..rrrrkrrkrrrr..',
  '..rrrrrrrrrrrr..',
];

export const RETRATOS = { player: PLAYER, carmen: CARMEN } as const;
export type Personaje = keyof typeof RETRATOS;

export function dibujarRetrato(personaje: Personaje): HTMLCanvasElement {
  const lienzo = document.createElement('canvas');
  lienzo.width = 16;
  lienzo.height = 16;
  lienzo.className = 'retrato';
  const ctx = lienzo.getContext('2d');
  if (!ctx) return lienzo;
  RETRATOS[personaje].forEach((fila, y) => {
    [...fila].forEach((pixel, x) => {
      ctx.fillStyle = PALETA[pixel] ?? PALETA['.'];
      ctx.fillRect(x, y, 1, 1);
    });
  });
  return lienzo;
}
