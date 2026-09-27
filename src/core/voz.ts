// Narración en voz alta para quienes todavía están aprendiendo a leer.
// Preferimos español latinoamericano; si no existe, cualquier voz en español.

const PREFERENCIAS = ['es-419', 'es-US', 'es-MX', 'es-CL', 'es-AR', 'es-CO'];

let vozElegida: SpeechSynthesisVoice | null = null;

function elegirVoz(): void {
  const voces = speechSynthesis.getVoices();
  for (const idioma of PREFERENCIAS) {
    const voz = voces.find((v) => v.lang.replace('_', '-') === idioma);
    if (voz) {
      vozElegida = voz;
      return;
    }
  }
  vozElegida = voces.find((v) => v.lang.startsWith('es')) ?? null;
}

if ('speechSynthesis' in window) {
  elegirVoz();
  speechSynthesis.addEventListener('voiceschanged', elegirVoz);
}

export function hablar(texto: string): void {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = vozElegida?.lang ?? 'es-419';
  if (vozElegida) frase.voice = vozElegida;
  frase.rate = 0.95;
  speechSynthesis.speak(frase);
}

export function callar(): void {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
