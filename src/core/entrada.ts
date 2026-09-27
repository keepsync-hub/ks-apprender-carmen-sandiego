// Entrada unificada: teclado + ratón en computadora, joystick y botones en pantalla táctil.
// El resto del juego solo lee `entrada.mover`, `entrada.saltar` y `entrada.girarCamara`.

export interface Entrada {
  /** Dirección deseada: x = derecha, y = adelante. Largo entre 0 y 1. */
  mover: { x: number; y: number };
  /** true durante el cuadro en que se pidió saltar. */
  saltar: boolean;
  /** Giro de cámara acumulado desde el último cuadro (radianes). */
  girarCamara: number;
  /** Llamar al final de cada cuadro. */
  finCuadro(): void;
  activar(activa: boolean): void;
}

const TECLAS_ADELANTE = ['KeyW', 'ArrowUp'];
const TECLAS_ATRAS = ['KeyS', 'ArrowDown'];
const TECLAS_IZQUIERDA = ['KeyA', 'ArrowLeft'];
const TECLAS_DERECHA = ['KeyD', 'ArrowRight'];
const TECLAS_SALTO = ['Space'];
const TECLAS_GIRO_IZQ = ['KeyQ'];
const TECLAS_GIRO_DER = ['KeyE'];

export function esTactil(): boolean {
  return matchMedia('(pointer: coarse)').matches;
}

export function crearEntrada(lienzo: HTMLCanvasElement): Entrada {
  const apretadas = new Set<string>();
  const joystick = { x: 0, y: 0 };
  let pidioSalto = false;
  let giro = 0;
  let activa = false;

  const algunaApretada = (teclas: string[]) => teclas.some((t) => apretadas.has(t));

  window.addEventListener('keydown', (e) => {
    if (!activa) return;
    if ([...TECLAS_SALTO, 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault(); // que las flechas y el espacio no desplacen la página
    }
    if (TECLAS_SALTO.includes(e.code) && !e.repeat) pidioSalto = true;
    apretadas.add(e.code);
  });
  window.addEventListener('keyup', (e) => apretadas.delete(e.code));
  window.addEventListener('blur', () => apretadas.clear());

  // Arrastrar sobre la escena (ratón o dedo) gira la cámara.
  let arrastre: { id: number; x: number } | null = null;
  lienzo.addEventListener('pointerdown', (e) => {
    if (!activa) return;
    arrastre = { id: e.pointerId, x: e.clientX };
    lienzo.setPointerCapture(e.pointerId);
  });
  lienzo.addEventListener('pointermove', (e) => {
    if (!arrastre || arrastre.id !== e.pointerId) return;
    giro -= (e.clientX - arrastre.x) * 0.008;
    arrastre.x = e.clientX;
  });
  const soltar = (e: PointerEvent) => {
    if (arrastre?.id === e.pointerId) arrastre = null;
  };
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);

  // Controles táctiles en pantalla.
  const controles = document.createElement('div');
  controles.className = 'controles-tactiles';
  controles.hidden = true;
  const base = document.createElement('div');
  base.className = 'joystick';
  const palanca = document.createElement('div');
  palanca.className = 'palanca';
  base.append(palanca);
  const botonSalto = document.createElement('button');
  botonSalto.className = 'boton boton-salto';
  botonSalto.textContent = 'Saltar';
  controles.append(base, botonSalto);
  document.body.append(controles);

  let dedoJoystick: number | null = null;
  const moverPalanca = (e: PointerEvent) => {
    const caja = base.getBoundingClientRect();
    const radio = caja.width / 2;
    let dx = (e.clientX - (caja.left + radio)) / radio;
    let dy = (e.clientY - (caja.top + radio)) / radio;
    const largo = Math.hypot(dx, dy);
    if (largo > 1) {
      dx /= largo;
      dy /= largo;
    }
    joystick.x = dx;
    joystick.y = -dy;
    palanca.style.transform = `translate(${dx * radio * 0.6}px, ${dy * radio * 0.6}px)`;
  };
  base.addEventListener('pointerdown', (e) => {
    dedoJoystick = e.pointerId;
    base.setPointerCapture(e.pointerId);
    moverPalanca(e);
  });
  base.addEventListener('pointermove', (e) => {
    if (e.pointerId === dedoJoystick) moverPalanca(e);
  });
  const soltarJoystick = (e: PointerEvent) => {
    if (e.pointerId !== dedoJoystick) return;
    dedoJoystick = null;
    joystick.x = 0;
    joystick.y = 0;
    palanca.style.transform = '';
  };
  base.addEventListener('pointerup', soltarJoystick);
  base.addEventListener('pointercancel', soltarJoystick);
  botonSalto.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pidioSalto = true;
  });

  const entrada: Entrada = {
    mover: { x: 0, y: 0 },
    saltar: false,
    girarCamara: 0,
    finCuadro() {
      pidioSalto = false;
      giro = 0;
    },
    activar(valor) {
      activa = valor;
      controles.hidden = !(valor && esTactil());
      if (!valor) apretadas.clear();
    },
  };

  // Se recalcula en cada lectura para combinar teclado y joystick.
  Object.defineProperties(entrada, {
    mover: {
      get() {
        if (!activa) return { x: 0, y: 0 };
        let x = joystick.x;
        let y = joystick.y;
        if (algunaApretada(TECLAS_DERECHA)) x += 1;
        if (algunaApretada(TECLAS_IZQUIERDA)) x -= 1;
        if (algunaApretada(TECLAS_ADELANTE)) y += 1;
        if (algunaApretada(TECLAS_ATRAS)) y -= 1;
        const largo = Math.hypot(x, y);
        return largo > 1 ? { x: x / largo, y: y / largo } : { x, y };
      },
    },
    saltar: { get: () => activa && pidioSalto },
    girarCamara: {
      get() {
        let g = giro;
        if (algunaApretada(TECLAS_GIRO_IZQ)) g += 0.04;
        if (algunaApretada(TECLAS_GIRO_DER)) g -= 0.04;
        return activa ? g : 0;
      },
    },
  });

  return entrada;
}
