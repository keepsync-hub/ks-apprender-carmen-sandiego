import type { Categoria, IdOperativo, Operativo } from './tipos';

// Operativos de V.I.L.E. inspirados en la serie. Los rasgos son los de sus modelos
// en este juego (lo que la niña o el niño puede ver), no datos oficiales.
export const OPERATIVOS: Record<IdOperativo, Operativo> = {
  'le-chevre': {
    id: 'le-chevre',
    nombre: 'Le Chèvre',
    rasgos: { pasatiempo: 'trepar', ropa: 'gris' },
    color: 0x8a8a96,
    huida: 'saltar',
    accesorio: 'cuernos',
  },
  'el-topo': {
    id: 'el-topo',
    nombre: 'El Topo',
    rasgos: { pasatiempo: 'excavar', ropa: 'café' },
    color: 0x7a4a2b,
    huida: 'excavar',
    accesorio: 'casco',
  },
  tigress: {
    id: 'tigress',
    nombre: 'Tigress',
    rasgos: { pasatiempo: 'trepar', ropa: 'morada' },
    color: 0x7a4fb0,
    huida: 'saltar',
    accesorio: 'orejas',
  },
  paperstar: {
    id: 'paperstar',
    nombre: 'Paperstar',
    rasgos: { pasatiempo: 'origami', ropa: 'rosada' },
    color: 0xe07bb0,
    huida: 'saltar',
    accesorio: 'ninguno',
  },
  neal: {
    id: 'neal',
    nombre: 'Neal the Eel',
    rasgos: { pasatiempo: 'nadar', ropa: 'café' },
    color: 0x7a4a2b,
    huida: 'saltar',
    accesorio: 'ninguno',
  },
};

/**
 * Opciones que muestra la Crime Net para cada categoría. `imagen` usa el mismo
 * formato que las pistas: un emoji o `color:#rrggbb` para una muestra de color.
 */
export const OPCIONES_RASGOS: Record<Categoria, { valor: string; imagen: string; etiqueta: string }[]> = {
  pasatiempo: [
    { valor: 'trepar', imagen: '🧗', etiqueta: 'Trepar' },
    { valor: 'excavar', imagen: '⛏️', etiqueta: 'Excavar' },
    { valor: 'origami', imagen: '📄', etiqueta: 'Origami' },
    { valor: 'nadar', imagen: '🏊', etiqueta: 'Nadar' },
  ],
  ropa: [
    { valor: 'gris', imagen: 'color:#8a8a96', etiqueta: 'Gris' },
    { valor: 'café', imagen: 'color:#7a4a2b', etiqueta: 'Café' },
    { valor: 'morada', imagen: 'color:#7a4fb0', etiqueta: 'Morada' },
    { valor: 'rosada', imagen: 'color:#e07bb0', etiqueta: 'Rosada' },
  ],
};

export const NOMBRES_CATEGORIA: Record<Categoria, string> = {
  pasatiempo: '¿Qué le gusta hacer?',
  ropa: '¿De qué color es su ropa?',
};
