import type { Caso } from './tipos';

// Caso 1, inspirado en «The Lucky Cat Caper» de la serie. La ruta del ladrón es
// San Francisco → Ciudad de México → Buenos Aires.
//
// Identificación en la Crime Net:
// - Aprendiz: basta la ropa gris (solo Le Chèvre viste de gris).
// - Detective: hace falta cruzar «trepar» (Le Chèvre o Tigress) con «ropa gris».
export const CASO_GATO_DE_LA_SUERTE: Caso = {
  id: 'gato-de-la-suerte',
  titulo: 'El caso del Gato de la Suerte',
  tesoro: 'el Gato de la Suerte dorado',
  iconoTesoro: '🐈',
  ladron: 'le-chevre',
  final: 'buenos-aires',
  paradas: [
    {
      ciudad: 'san-francisco',
      senuelos: ['lima', 'tokio'],
      testigos: [
        {
          nombre: 'Señora Wong',
          color: 0x3bb2a6,
          pista: {
            texto: 'Me preguntó por una bandera verde, blanca y roja, con un águila en el centro.',
            aprendiz: 'Su bandera es verde, blanca y roja.',
            imagen: 'bandera:ciudad-de-mexico',
          },
        },
        {
          nombre: 'Pescador Joe',
          color: 0x2f5fb3,
          pista: {
            texto: 'Dijo que iba a comer tacos y a visitar pirámides muy antiguas.',
            aprendiz: '¡Quería comer tacos!',
            imagen: '🌮',
          },
        },
        {
          nombre: 'Niña del tranvía',
          color: 0xf2a541,
          nivel: 'detective',
          pista: {
            texto: '¡Trepaba por las paredes como una cabra de montaña!',
            aprendiz: 'Trepaba como una cabra.',
            imagen: '🧗',
            rasgo: { categoria: 'pasatiempo', valor: 'trepar' },
          },
        },
        {
          nombre: 'Niña del tranvía',
          color: 0xf2a541,
          nivel: 'aprendiz',
          pista: {
            texto: 'Llevaba ropa gris y un gato dorado en la mochila.',
            aprendiz: 'Llevaba ropa gris.',
            imagen: 'color:#8a8a96',
            rasgo: { categoria: 'ropa', valor: 'gris' },
          },
        },
      ],
    },
    {
      ciudad: 'ciudad-de-mexico',
      senuelos: ['santiago', 'rio-de-janeiro'],
      testigos: [
        {
          nombre: 'Don Pepe',
          color: 0x222222,
          pista: {
            texto: 'Preguntó por una bandera celeste y blanca, con un sol amarillo.',
            aprendiz: 'Su bandera es celeste y blanca.',
            imagen: 'bandera:buenos-aires',
          },
        },
        {
          nombre: 'Lupita',
          color: 0xe85d75,
          pista: {
            texto: 'Me dijo que quería aprender a bailar tango.',
            aprendiz: 'Quería bailar tango.',
            imagen: '💃',
          },
        },
        {
          nombre: 'Guía del museo',
          color: 0x8f5bd6,
          nivel: 'detective',
          pista: {
            texto: 'Vi a alguien con ropa gris escondiendo un gato dorado.',
            aprendiz: 'Llevaba ropa gris.',
            imagen: 'color:#8a8a96',
            rasgo: { categoria: 'ropa', valor: 'gris' },
          },
        },
        {
          nombre: 'Guía del museo',
          color: 0x8f5bd6,
          nivel: 'aprendiz',
          pista: {
            texto: 'Tomaba mate, una bebida muy popular en Argentina.',
            aprendiz: 'Tomaba mate.',
            imagen: '🧉',
          },
        },
      ],
    },
  ],
};

export const CASOS = [CASO_GATO_DE_LA_SUERTE];
