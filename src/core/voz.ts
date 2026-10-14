// Narración en voz alta para quienes todavía están aprendiendo a leer.
// Preferimos español latinoamericano; si no existe, cualquier voz en español.
// Las palabras en inglés se pronuncian con una voz en inglés, si hay alguna.

const PREFERENCIAS = ['es-419', 'es-US', 'es-MX', 'es-CL', 'es-AR', 'es-CO'];
const PREFERENCIAS_INGLES = ['en-US', 'en-GB'];

let vozElegida: SpeechSynthesisVoice | null = null;
let vozIngles: SpeechSynthesisVoice | null = null;
let activa = true;

export function configurarVoz(encendida: boolean): void {
  activa = encendida;
  if (!encendida) callar();
}

function buscar(voces: SpeechSynthesisVoice[], preferencias: string[], prefijo: string) {
  for (const idioma of preferencias) {
    const voz = voces.find((v) => v.lang.replace('_', '-') === idioma);
    if (voz) return voz;
  }
  return voces.find((v) => v.lang.startsWith(prefijo)) ?? null;
}

function elegirVoz(): void {
  const voces = speechSynthesis.getVoices();
  vozElegida = buscar(voces, PREFERENCIAS, 'es');
  vozIngles = buscar(voces, PREFERENCIAS_INGLES, 'en');
}

if ('speechSynthesis' in window) {
  elegirVoz();
  speechSynthesis.addEventListener('voiceschanged', elegirVoz);
}

/** Un trozo de narración; `ingles` lo pronuncia con voz en inglés. */
export interface Frase {
  texto: string;
  ingles?: boolean;
}

function decir(frase: Frase): void {
  const voz = frase.ingles ? vozIngles : vozElegida;
  const enunciado = new SpeechSynthesisUtterance(frase.texto);
  enunciado.lang = voz?.lang ?? (frase.ingles ? 'en-US' : 'es-419');
  if (voz) enunciado.voice = voz;
  // El inglés, un poco más lento para que se escuche bien cada sonido.
  enunciado.rate = frase.ingles ? 0.8 : 0.95;
  speechSynthesis.speak(enunciado);
}

export function hablar(texto: string): void {
  hablarFrases([{ texto }]);
}

/** Narra varias frases seguidas, mezclando español e inglés. */
export function hablarFrases(frases: Frase[]): void {
  if (!activa || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  for (const frase of frases) if (frase.texto) decir(frase);
}

export function callar(): void {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
