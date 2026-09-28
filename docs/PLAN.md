# Plan: juego "Carmen Sandiego" (sitio estático en GitHub Pages)

La investigación de apoyo (juego de los 90, serie de Netflix, personajes, gadgets y lugares)
está en [`INVESTIGACION.md`](./INVESTIGACION.md).

## 1. Contexto y objetivo

- Queremos un **juego 3D en el navegador** donde se controla a **Carmen Sandiego** en un mundo
  navegable, con movimiento libre y misiones al estilo **Roblox**, la **presentación retro** del
  juego clásico de los 90 y el **argumento de la serie de Netflix**.
- Se publica como **sitio estático en GitHub Pages** (repo público): sin servidor, todo en el cliente.

## 2. Decisiones tomadas

| Tema | Decisión | Consecuencias en el diseño |
|------|----------|----------------------------|
| Público | **Niñas y niños de 6 a 9 años** | Frases cortas, todo narrado en voz alta, pistas con imágenes, sin castigos duros, sin violencia. |
| Idioma | **Español latinoamericano** | Tuteo ("tú", "ustedes", nunca "vosotros"); vocabulario latino: *computadora, celular, auto, lentes*. Voz sintetizada `es-419` / `es-MX` / `es-CL` según disponibilidad. |
| Enfoque | **Educación + acción** | Cada misión enseña geografía y cultura (el espíritu del original de 1985) y se juega moviéndose, trepando y usando gadgets. |
| Publicación | **Repo público → GitHub Pages** | Deploy automático con GitHub Actions. |

### 2.1 Reglas por edad (6–9 años)

- **Dos niveles de dificultad** al inicio:
  - **Aprendiz (6–7):** 2 opciones por decisión, pistas 100 % con imagen + voz, sin reloj.
  - **Detective (8–9):** 3 opciones, pistas con texto breve + imagen, reloj suave (solo afecta las estrellas obtenidas, nunca hace perder la misión).
- **Todo diálogo se narra** con la Web Speech API (botón 🔊 para repetir). Máximo ~15 palabras por globo.
- **Nunca se pierde del todo**: si eliges mal, Player da una pista extra ("¡Uy! Aquí nadie vio nada. Recuerda: buscamos un país con canguros 🦘").
- **Acción no violenta**: Carmen no pelea a golpes. Atrapa a los operativos con **trampas y
  habilidad** (alcanzarlos en una persecución, esquivar, activar una red, encerrar con una reja
  hackeada). Los villanos son cómicos, no aterradores.
- **Contenido de la serie que se omite**: muerte del padre de Carmen, venenos (Lady Dokuso),
  borrado de memoria, la faceta psicópata de Paperstar (queda como "la de las estrellas de papel").
- **Privacidad infantil**: sin cuentas, sin chat, sin anuncios, sin analítica ni cookies de
  terceros. El progreso se guarda solo en `localStorage` del dispositivo.
- **Accesibilidad**: botones grandes (≥ 64 px en táctil), alto contraste, texto grande,
  opción para reducir el efecto CRT/parpadeos, controles simples (un botón = un gadget).

## 3. Concepto de juego

**Premisa:** Carmen ("Black Sheep") le roba a V.I.L.E. para devolver los tesoros a sus
dueños. **Player** la guía por los aretes comunicadores; **Zack e Ivy** la llevan en su auto y su
avión. **Chase Devineaux** (ACME) la persigue y siempre llega tarde (gag recurrente).

**Bucle de una misión ("Caso")**, adaptado del clásico de 1985:

1. **Aviso retro** (pantalla VGA): Player cuenta que alguien de V.I.L.E. robó un tesoro ("¡Alguien de V.I.L.E. robó el Gato de la Suerte dorado!"); quién fue se descubre en la Crime Net.
2. **Exploración libre** del barrio 3D de la ciudad (estilo bloques).
3. **Buscar pistas** (3 por ciudad): hablar con testigos, mirar con **binoculares**, **hackear** una computadora con el **labial**.
   - *Pista de destino* con imagen: bandera, animal, comida, monumento, moneda, idioma ("Dijo *¡Che!* y pidió un mate 🧉").
   - *Pista del sospechoso* con imagen: color de pelo, gadget, pasatiempo.
4. **Crime Net** (pantalla ámbar): elegir con íconos los rasgos hasta que quede un solo operativo → "¡Operativo identificado!" (la *orden de arresto* del original).
5. **Mapamundi**: elegir entre 2–3 destinos con foto y bandera; Zack "vuela" con una línea punteada retro.
6. **Final de acción**: persecución por azoteas con **gancho** (y **planeador** en v2), llegar antes que el operativo y activar la trampa.
7. **Cierre**: el tesoro se devuelve con la tarjeta roja de Carmen; Chase llega tarde. Se gana:
   - **Estrellas** (1–3), **una carta del Álbum de Ciudades** (datos curiosos, bandera, mapa) y
   - **ascenso de rango** (guiño a 1985): *Novata/o → Aprendiz → Investigador/a → Agente Especial → Detective Estrella*.

## 4. Movimiento y gadgets

| Prioridad | Gadget / acción | Mecánica (simplificada para niños) |
|-----------|-----------------|------------------------------------|
| MVP | Correr, saltar | 3ª persona tipo Roblox: WASD/flechas + ratón; joystick y botón de salto en táctil. |
| MVP | **Gancho de muñeca** | Los puntos de anclaje brillan en rojo; un botón engancha el más cercano a la vista y tira a Carmen hacia él (apuntado automático). |
| MVP | **Labial hacker** | Acércate a una computadora → minijuego corto (unir colores / repetir secuencia, estilo 8 bits). |
| MVP | **Aretes comunicadores** | Globo de Player con voz en el HUD. |
| v2 | **Planeador** | Mantener salto en el aire → planea despacio. |
| v2 | **Binoculares** | Modo mirar: resalta pistas y anclajes. |
| v2 | **Cortador láser** | Abrir vitrinas trazando una figura (enseña formas geométricas). |
| v3 | **Dron rojo**, **espejo rastreador** | Explorar desde arriba; seguir a un operativo marcado. |

## 5. Contenido por fases

- **MVP**
  - **Prólogo – Isla de V.I.L.E.**: Black Sheep escapa de la escuela. Tutorial de correr, saltar, gancho y labial. Coach Brunt como "entrenadora" cómica.
  - **Caso 1 – "El caso del Gato de la Suerte"**: San Francisco → pistas llevan a **Ciudad de México** → final en **Buenos Aires**. Operativo: **Le Chèvre** (parkour).
- **v2**
  - **Caso 2 – "El caso de las piedras de Río"**: Río de Janeiro → Lima → Quito. Operativo: **El Topo** (huye cavando túneles). ✅
    Hitos: Cristo Redentor y Mitad del Mundo con la línea del ecuador. Pantalla «Elige un caso».
  - **Caso 3 – "El caso del moái perdido"** (original, no está en la serie): **Santiago → Tokio → Rapa Nui**. Operativo: **Tigress**. ✅
    Hitos: cordillera de los Andes, torre roja de Tokio y moáis sobre su ahu (suelo de pasto y casas bajas).
  - **Caso 4 – París / Casablanca**. Operativo: **Paperstar**.
  - Álbum de Ciudades completo; planeador y binoculares.
- **v3**
  - Asia y Oceanía (Tokio, Sídney, Bombay), jefes de la Facultad en versión cómica (Condesa Cleo, Dra. Bellum), persecución de ACME en tiempo real.

**Prioridad latinoamericana**: al menos la mitad de las ciudades del juego son de Latinoamérica.

## 6. Estilo visual y audio

- **3D estilo Roblox**: personajes de bloques (cajas con texturas simples), ciudades con primitivas de bajo polígono y colores vivos. Carmen: gabardina y sombrero rojos; cada operativo reconocible por silueta y color.
- **Capa retro 90s** en la interfaz: fuente pixelada, paleta VGA, ventanas biseladas, retratos pixel art, mapamundi con líneas punteadas, Crime Net ámbar, efecto CRT suave y desactivable.
- **Audio**: jingles chiptune originales generados con Web Audio; voz con Web Speech API.
- Arte y música originales (proyecto de fan; aviso visible en el pie del sitio).

## 7. Arquitectura técnica

| Tema | Decisión |
|------|----------|
| Build | **Vite + TypeScript**, salida estática en `dist/`. |
| 3D | **Three.js**. Modelos por código (cajas) al inicio; luego glTF hechos en Blockbench. |
| Física | Colisiones propias contra cajas (AABB) para el MVP — el mundo es de bloques y así el gancho y el salto son predecibles. Se evalúa **Rapier** si aparecen necesidades de física más complejas. |
| UI retro | DOM + CSS sobre el canvas (diálogos, Crime Net, mapa, menús). |
| Contenido | **Data-driven**: casos, ciudades, pistas y operativos en `src/data/*.ts` tipados, para sumar misiones sin tocar el motor. |
| Estado | Máquina de estados: Menú → Aviso → Exploración → Crime Net → Mapa → Final → Resultado. |
| Voz | `speechSynthesis` con preferencia `es-419`, luego cualquier `es-*`. |
| Deploy | GitHub Actions (`actions/deploy-pages`), `base` de Vite = `/ks-apprender-carmen-sandiego/`. |

### Estructura

```
index.html
vite.config.ts
.github/workflows/deploy.yml
public/            texturas, sonidos
src/
  main.ts          arranque y loop
  core/            estados, input (teclado + táctil), audio, voz, guardado
  world/           construcción de barrios, cámara, iluminación, colisiones
  player/          Carmen de bloques y su controlador
  gadgets/         grapple.ts, lipstick.ts, glider.ts …
  npc/             testigos, operativos V.I.L.E., Chase Devineaux
  missions/        motor de casos, pistas, Crime Net, estrellas
  ui/              diálogos, HUD, mapamundi, Crime Net (CSS retro)
  data/            casos, ciudades, operativos
docs/              PLAN.md, INVESTIGACION.md
```

## 8. Hitos

1. **Esqueleto**: Vite + TS + Three.js, pantalla de título retro, escena 3D, deploy a Pages. ✅
2. **Carmen jugable**: personaje de bloques, cámara 3ª persona, correr/saltar, colisiones, controles táctiles. ✅
3. **Gancho** con apuntado automático (tirón hasta la azotea; el balanceo queda para v2). ✅
4. **UI retro + voz**: diálogos con retrato y máquina de escribir, narración, textos por nivel, menú de pausa con ajustes, sonidos chiptune. ✅
5. **Motor de casos**: testigos, pistas con imagen, Crime Net, mapamundi, estrellas y rango. ✅
   - Caso 1 jugable completo (San Francisco → Ciudad de México → Buenos Aires, Le Chèvre).
   - Pendiente: reloj suave del nivel Detective (hoy las estrellas dependen solo de los destinos equivocados).
6. **Labial hacker**: minijuego de secuencia de colores y formas en computadoras de V.I.L.E. (una pista por ciudad). ✅
7. **Prólogo en la Isla de V.I.L.E.** (el Caso 1 ya quedó hecho en el hito 5).
8. **Pulido**: audio, guardado, Álbum de Ciudades, aviso de fan.
9. **v2 / v3**.

## 9. Verificación

- `npm run dev` en escritorio y emulación móvil.
- `npm run build && npm run preview` para validar rutas con el `base` de Pages.
- Vitest para el motor de casos (pistas coherentes, destino correcto, Crime Net).
- Playwright (Chromium preinstalado): cargar la página, iniciar el juego, mover a Carmen.
- Tras el merge a `main`, comprobar que el workflow publique y el sitio cargue.
- Prueba con niñas y niños reales de 6 y 9 años en cada hito jugable.
