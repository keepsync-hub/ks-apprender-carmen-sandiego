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
  o: '#d9661f', // pelo colorín
  b: '#2f5fb3', // polera azul
  y: '#7a4fb0', // polera morada
  d: '#7a4a2b', // piel oscura
  w: '#e8e8e8', // pelo canoso
  c: '#c8a46a', // gabardina beige
  x: '#2a2a3a', // traje oscuro
  f: '#d98a6a', // pecas
  q: '#8a8a96', // gris Le Chèvre
  l: '#e8e2d0', // cuernos
  u: '#7a4a2b', // café El Topo
  j: '#ffd23f', // lámpara
  v: '#5a2f8a', // morado oscuro
  z: '#f2d27a', // pelo rubio
  p: '#e07bb0', // rosado
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

// Zack: chofer, pelo colorín y polera azul.
const ZACK = [
  '................',
  '....oooooooo....',
  '...oooooooooo...',
  '...oossssssoo...',
  '...osssssssso...',
  '...ssesssses....',
  '...sfssssssfs...',
  '...ssssssssss...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....bbbbbbbb....',
  '...bbbbbbbbbb...',
  '..bbbbbbbbbbbb..',
  '..bbbbbbbbbbbb..',
  '..bbbbbbbbbbbb..',
];

// Ivy: mecánica, pelo colorín tomado y polera morada.
const IVY = [
  '..........oo....',
  '.....oooooooo...',
  '....oooooooooo..',
  '...oossssssoo...',
  '...osssssssso...',
  '...ssesssses....',
  '...sfssssssfs...',
  '...ssssssssss...',
  '....sssmmsss....',
  '.....ssssss.....',
  '......ssss......',
  '....yyyyyyyy....',
  '...yyyyyyyyyy...',
  '..yyyyyyyyyyyy..',
  '..yyyyyyyyyyyy..',
  '..yyyyyyyyyyyy..',
];

// La Jefa de ACME: pelo canoso corto y traje oscuro.
const JEFA = [
  '................',
  '.....wwwwww.....',
  '....wwwwwwww....',
  '...wwddddddww...',
  '...wddddddddw...',
  '...ddeddddedd...',
  '...dddddddddd...',
  '...dddddddddd...',
  '....ddmmmmdd....',
  '.....dddddd.....',
  '......dddd......',
  '....xxxwwxxx....',
  '...xxxxwwxxxx...',
  '..xxxxxwwxxxxx..',
  '..xxxxxxxxxxxx..',
  '..xxxxxxxxxxxx..',
];

// Chase Devineaux: inspector con pelo negro peinado y gabardina beige.
const CHASE = [
  '................',
  '....nnnnnnnn....',
  '...nnnnnnnnnn...',
  '...nnssssssnn...',
  '...nsssssssn....',
  '...ssesssses....',
  '...ssssssssss...',
  '...ssssssssss...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....ccccwccc....',
  '...cccccwcccc...',
  '..ccccccwccccc..',
  '..cccccccccccc..',
  '..cccccccccccc..',
];

// Le Chèvre: capucha gris con cuernos de cabra.
const LE_CHEVRE = [
  '..l..........l..',
  '..ll........ll..',
  '...lqqqqqqqql...',
  '...qqqqqqqqqq...',
  '...qqssssssqq...',
  '...qsesssesq....',
  '...qssssssssq...',
  '...qssssssssq...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....qqqqqqqq....',
  '...qqqqqqqqqq...',
  '..qqqqqqqqqqqq..',
  '..qqqqqqqqqqqq..',
  '..qqqqqqqqqqqq..',
];

// El Topo: casco café con lámpara y lentes.
const EL_TOPO = [
  '................',
  '.......jj.......',
  '....uuuuuuuu....',
  '...uuuuuuuuuu...',
  '..uuuuuuuuuuuu..',
  '...eeeessseeee..',
  '...eaaeeseaae...',
  '...ssssssssss...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....uuuuuuuu....',
  '...uuuuuuuuuu...',
  '..uuuuuuuuuuuu..',
  '..uuuuuuuuuuuu..',
  '..uuuuuuuuuuuu..',
];

// Tigress: antifaz morado con orejas de gato.
const TIGRESS = [
  '..vv........vv..',
  '..vvv......vvv..',
  '...vvvvvvvvvv...',
  '...vvvvvvvvvv...',
  '...vvvvvvvvvv...',
  '...vjevvvvejv...',
  '...vvvvvvvvvv...',
  '...ssssssssss...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....yyyyyyyy....',
  '...yyyyyyyyyy...',
  '..yyyyyyyyyyyy..',
  '..yyyyyyyyyyyy..',
  '..yyyyyyyyyyyy..',
];

// Paperstar: pelo rubio con coletas y ropa rosada.
const PAPERSTAR = [
  '................',
  '....zzzzzzzz....',
  '...zzzzzzzzzz...',
  '.zzzzssssssszzz.',
  '.zz.ssssssss.zz.',
  '.zz.sessssesszz.',
  '.z..ssssssss..z.',
  '....ssssssss....',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....pppppppp....',
  '...pppppppppp...',
  '..pppppppppppp..',
  '..pppppppppppp..',
  '..pppppppppppp..',
];

// Testigo genérico con gorra.
const TESTIGO = [
  '................',
  '....bbbbbbbb....',
  '...bbbbbbbbbb...',
  '...bbbbbbbbbbbb.',
  '...hhssssssh....',
  '...hsesssesh....',
  '...ssssssssss...',
  '...ssssssssss...',
  '....ssmmmmss....',
  '.....ssssss.....',
  '......ssss......',
  '....gggggggg....',
  '...gggggggggg...',
  '..gggggggggggg..',
  '..gggggggggggg..',
  '..gggggggggggg..',
];

export const RETRATOS = {
  player: PLAYER,
  carmen: CARMEN,
  zack: ZACK,
  ivy: IVY,
  jefa: JEFA,
  chase: CHASE,
  'le-chevre': LE_CHEVRE,
  'el-topo': EL_TOPO,
  tigress: TIGRESS,
  paperstar: PAPERSTAR,
  testigo: TESTIGO,
} as const;
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
