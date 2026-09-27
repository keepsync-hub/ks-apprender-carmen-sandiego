import type { Caso } from './tipos';

// Caso 1, inspirado en «The Lucky Cat Caper» de la serie. La ruta del ladrón es
// San Francisco → Ciudad de México → Buenos Aires.
//
// Identificación en la Crime Net:
// - Aprendiz: una pista, la ropa gris (solo Le Chèvre viste de gris).
// - Detective: dos pistas; «trepar» sola deja a Le Chèvre y a Tigress.
export const CASO_GATO_DE_LA_SUERTE: Caso = {
  id: 'gato-de-la-suerte',
  titulo: 'El caso del Gato de la Suerte',
  tesoro: 'el Gato de la Suerte dorado',
  iconoTesoro: '🐈',
  fraseLadron: { texto: '¡Sacrebleu! ¡Otra vez esa Carmen Sandiego!', aprendiz: '¡Oh, no! ¡Carmen otra vez!' },
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
          nombre: 'Computadora de V.I.L.E.',
          tipo: 'computadora',
          color: 0x55555f,
          pista: {
            texto: 'Mensaje secreto: «Mañana, a comer tacos junto a las pirámides.»',
            aprendiz: 'Mensaje: «¡A comer tacos!»',
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
          nombre: 'Computadora de V.I.L.E.',
          tipo: 'computadora',
          color: 0x55555f,
          pista: {
            texto: 'Mensaje secreto: «Clase de tango reservada. No llegues tarde.»',
            aprendiz: 'Mensaje: «¡A bailar tango!»',
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

// Caso 2, inspirado en «The Hot Rocks of Rio Caper». Ruta: Río de Janeiro → Lima → Quito.
//
// Identificación en la Crime Net:
// - Aprendiz: una pista, «excavar» (solo El Topo cava).
// - Detective: dos pistas; «ropa café» sola deja a El Topo y a Neal the Eel.
export const CASO_PIEDRAS_DE_RIO: Caso = {
  id: 'piedras-de-rio',
  titulo: 'El caso de las piedras de Río',
  tesoro: 'las piedras preciosas del Carnaval',
  iconoTesoro: '💎',
  fraseLadron: { texto: '¡Caramba! ¡Casi llego al final de mi túnel!', aprendiz: '¡Caramba! ¡Me atrapaste!' },
  ladron: 'el-topo',
  final: 'quito',
  paradas: [
    {
      ciudad: 'rio-de-janeiro',
      senuelos: ['santiago', 'tokio'],
      testigos: [
        {
          nombre: 'Bailarina de samba',
          color: 0xf2c14e,
          pista: {
            texto: 'Me preguntó por una bandera roja, blanca y roja, con franjas de arriba abajo.',
            aprendiz: 'Su bandera es roja, blanca y roja.',
            imagen: 'bandera:lima',
          },
        },
        {
          nombre: 'Computadora de V.I.L.E.',
          tipo: 'computadora',
          color: 0x55555f,
          pista: {
            texto: 'Mensaje secreto: «Nos vemos en el país de las llamas y las alpacas.»',
            aprendiz: 'Mensaje: «¡A ver llamas!»',
            imagen: '🦙',
          },
        },
        {
          nombre: 'Vendedor de cocos',
          color: 0x3bb273,
          nivel: 'detective',
          pista: {
            texto: 'Llevaba ropa café, toda llena de tierra.',
            aprendiz: 'Llevaba ropa café.',
            imagen: 'color:#7a4a2b',
            rasgo: { categoria: 'ropa', valor: 'café' },
          },
        },
        {
          nombre: 'Vendedor de cocos',
          color: 0x3bb273,
          nivel: 'aprendiz',
          pista: {
            texto: '¡Salió de un hoyo en el suelo, cavando con garras de metal!',
            aprendiz: 'Cavaba un hoyo en el suelo.',
            imagen: '⛏️',
            rasgo: { categoria: 'pasatiempo', valor: 'excavar' },
          },
        },
      ],
    },
    {
      ciudad: 'lima',
      senuelos: ['buenos-aires', 'ciudad-de-mexico'],
      testigos: [
        {
          nombre: 'Cocinero',
          color: 0xe8e8e8,
          pista: {
            texto: 'Preguntó por una bandera amarilla, azul y roja, con franjas acostadas.',
            aprendiz: 'Su bandera es amarilla, azul y roja.',
            imagen: 'bandera:quito',
          },
        },
        {
          nombre: 'Computadora de V.I.L.E.',
          tipo: 'computadora',
          color: 0x55555f,
          pista: {
            texto: 'Mensaje secreto: «Después iré a ver las tortugas gigantes de Galápagos.»',
            aprendiz: 'Mensaje: «¡A ver tortugas gigantes!»',
            imagen: '🐢',
          },
        },
        {
          nombre: 'Guía turística',
          color: 0x8f5bd6,
          nivel: 'detective',
          pista: {
            texto: '¡Lo vi cavar un túnel debajo de la plaza con garras de metal!',
            aprendiz: 'Cavaba un túnel.',
            imagen: '⛏️',
            rasgo: { categoria: 'pasatiempo', valor: 'excavar' },
          },
        },
        {
          nombre: 'Guía turística',
          color: 0x8f5bd6,
          nivel: 'aprendiz',
          pista: {
            texto: 'Me dijo que quería ver un volcán nevado muy alto.',
            aprendiz: 'Iba a ver un volcán.',
            imagen: '🌋',
          },
        },
      ],
    },
  ],
};

export const CASOS = [CASO_GATO_DE_LA_SUERTE, CASO_PIEDRAS_DE_RIO];
