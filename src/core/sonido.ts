// Efectos de sonido chiptune generados en vivo con Web Audio (sin archivos ni
// música con derechos). Ondas cuadradas y triangulares, como en los 90.

export type Efecto = 'clic' | 'letra' | 'salto' | 'gancho' | 'aviso' | 'fanfarria';

interface Nota {
  frecuencia: number;
  /** Frecuencia final (glissando); si falta, la nota es fija. */
  hasta?: number;
  inicio: number;
  duracion: number;
  onda?: OscillatorType;
  volumen?: number;
}

const EFECTOS: Record<Efecto, Nota[]> = {
  clic: [{ frecuencia: 880, inicio: 0, duracion: 0.05 }],
  letra: [{ frecuencia: 1320, inicio: 0, duracion: 0.02, volumen: 0.04 }],
  salto: [{ frecuencia: 330, hasta: 660, inicio: 0, duracion: 0.12, onda: 'triangle' }],
  gancho: [
    { frecuencia: 1200, hasta: 300, inicio: 0, duracion: 0.12 },
    { frecuencia: 300, hasta: 900, inicio: 0.12, duracion: 0.2, onda: 'triangle' },
  ],
  aviso: [
    { frecuencia: 988, inicio: 0, duracion: 0.06 },
    { frecuencia: 1319, inicio: 0.07, duracion: 0.1 },
  ],
  fanfarria: [
    { frecuencia: 523, inicio: 0, duracion: 0.12 },
    { frecuencia: 659, inicio: 0.12, duracion: 0.12 },
    { frecuencia: 784, inicio: 0.24, duracion: 0.12 },
    { frecuencia: 1047, inicio: 0.36, duracion: 0.3 },
  ],
};

let contexto: AudioContext | null = null;
let activo = true;

export function configurarSonido(encendido: boolean): void {
  activo = encendido;
}

export function sonar(efecto: Efecto): void {
  if (!activo || typeof AudioContext === 'undefined') return;
  // El navegador solo permite crear audio después de que la persona toca algo.
  contexto ??= new AudioContext();
  if (contexto.state === 'suspended') void contexto.resume();
  const ahora = contexto.currentTime;
  for (const nota of EFECTOS[efecto]) {
    const osc = contexto.createOscillator();
    const ganancia = contexto.createGain();
    osc.type = nota.onda ?? 'square';
    const t0 = ahora + nota.inicio;
    const t1 = t0 + nota.duracion;
    osc.frequency.setValueAtTime(nota.frecuencia, t0);
    if (nota.hasta) osc.frequency.exponentialRampToValueAtTime(nota.hasta, t1);
    ganancia.gain.setValueAtTime(nota.volumen ?? 0.08, t0);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(ganancia).connect(contexto.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}
