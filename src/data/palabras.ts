// Palabras en inglés que se aprenden durante los casos, con la misma dinámica de
// «Aprender Jugando 3D»: quien enseña dice la palabra y una pista que NO da la
// respuesta; hay que deducir qué significa. Van de las más fáciles a las más difíciles
// y todas tienen que ver con viajar y atrapar ladrones.

export interface Palabra {
  id: string;
  /** La palabra en inglés. */
  en: string;
  /** Su significado en español (la respuesta correcta). */
  es: string;
  emoji: string;
  /** Describe el significado sin decirlo. */
  pista: string;
}

export const PALABRAS: Palabra[] = [
  { id: 'hello', en: 'hello', es: 'hola', emoji: '👋', pista: 'La dices al encontrarte con alguien para saludar.' },
  { id: 'thanks', en: 'thanks', es: 'gracias', emoji: '🙏', pista: 'La dices cuando alguien te ayuda o te da algo.' },
  { id: 'friend', en: 'friend', es: 'amigo', emoji: '🤝', pista: 'Alguien en quien confías y con quien juegas.' },
  { id: 'cat', en: 'cat', es: 'gato', emoji: '🐱', pista: 'Animal de la casa que dice «miau».' },
  { id: 'sun', en: 'sun', es: 'sol', emoji: '☀️', pista: 'Brilla en el cielo de día y da calor.' },
  { id: 'red', en: 'red', es: 'rojo', emoji: '🟥', pista: 'El color de la gabardina de Carmen.' },
  { id: 'hat', en: 'hat', es: 'sombrero', emoji: '🎩', pista: 'Se usa en la cabeza; Carmen nunca sale sin el suyo.' },
  { id: 'car', en: 'car', es: 'auto', emoji: '🚗', pista: 'Tiene cuatro ruedas; Zack lo maneja muy rápido.' },
  { id: 'plane', en: 'plane', es: 'avión', emoji: '✈️', pista: 'Vuela por el cielo y te lleva a otro país.' },
  { id: 'map', en: 'map', es: 'mapa', emoji: '🗺️', pista: 'Dibujo del mundo que usas para saber a dónde ir.' },
  { id: 'city', en: 'city', es: 'ciudad', emoji: '🏙️', pista: 'Lugar grande con muchas calles, casas y edificios.' },
  { id: 'house', en: 'house', es: 'casa', emoji: '🏠', pista: 'El lugar donde vives y duermes.' },
  { id: 'water', en: 'water', es: 'agua', emoji: '💧', pista: 'La bebes cuando tienes sed; llena el mar.' },
  { id: 'sea', en: 'sea', es: 'mar', emoji: '🌊', pista: 'Mucha agua salada con olas y peces.' },
  { id: 'tree', en: 'tree', es: 'árbol', emoji: '🌳', pista: 'Tiene tronco y hojas; crece en el bosque.' },
  { id: 'bird', en: 'bird', es: 'pájaro', emoji: '🐦', pista: 'Animal con alas y plumas que canta y vuela.' },
  { id: 'mountain', en: 'mountain', es: 'montaña', emoji: '⛰️', pista: 'Es altísima y en la cima puede tener nieve.' },
  { id: 'bridge', en: 'bridge', es: 'puente', emoji: '🌉', pista: 'Sirve para cruzar un río o el mar sin mojarse.' },
  { id: 'star', en: 'star', es: 'estrella', emoji: '⭐', pista: 'Brilla de noche en el cielo.' },
  { id: 'key', en: 'key', es: 'llave', emoji: '🔑', pista: 'Con ella abres una puerta o un candado.' },
  { id: 'door', en: 'door', es: 'puerta', emoji: '🚪', pista: 'Por ahí entras y sales de una casa.' },
  { id: 'gold', en: 'gold', es: 'oro', emoji: '🪙', pista: 'Metal amarillo y brillante muy valioso.' },
  { id: 'treasure', en: 'treasure', es: 'tesoro', emoji: '💰', pista: 'Algo muy valioso que V.I.L.E. siempre quiere robar.' },
  { id: 'thief', en: 'thief', es: 'ladrón', emoji: '🦹', pista: 'Persona que se lleva lo que no es suyo.' },
];

export const PALABRAS_POR_ID: Record<string, Palabra> = Object.fromEntries(PALABRAS.map((p) => [p.id, p]));
