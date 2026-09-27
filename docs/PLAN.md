# Plan: juego "Carmen Sandiego" (sitio estático en GitHub Pages)

La investigación de apoyo (juego de los 90, serie de Netflix, personajes, gadgets y lugares)
está en [`INVESTIGACION.md`](./INVESTIGACION.md).

## 1. Contexto y objetivo

- El repositorio está vacío (solo `README.md`). Construimos desde cero.
- Queremos un **juego 3D en el navegador** donde el jugador controla a **Carmen Sandiego**
  en un mundo navegable, con movimiento libre y misiones al estilo **Roblox**, con la
  **presentación retro** del juego clásico de los 90 y el **argumento de la serie de Netflix**.
- Se publica como **sitio estático en GitHub Pages**: sin servidor, todo corre en el cliente.

## 2. Concepto de juego

**Premisa (serie Netflix, invertida respecto al clásico):** Carmen ("Black Sheep") roba a
V.I.L.E. para devolver lo robado. Player la guía por los aretes comunicadores. ACME (Chase
Devineaux, Julia Argent) la persigue creyendo que es la villana.

**Bucle de una misión ("Caper")** — mezcla del clásico de 1985 y el mundo libre de Roblox:

1. **Briefing retro** (pantalla VGA): Player anuncia el golpe de V.I.L.E. y el tesoro en riesgo.
2. **Exploración libre** de un distrito 3D de estilo bloques (la ciudad del caper).
3. **Pistas**: hablar con NPC testigos (diálogos con guiño a 1985: "Cambió su dinero por
   rupias…"), escanear con **binoculares**, **hackear** terminales con el **labial**.
4. **Crime Net**: pantalla de computadora ámbar donde se cruzan los rasgos del operativo
   (pelo, pasatiempo, rasgo, vehículo) para identificarlo → sin identificación, no hay "tag"
   de ubicación y el operativo huye (versión Netflix de la **orden de arresto**).
5. **Deducir la siguiente ciudad** por pistas geográficas (valor educativo del original) y
   "volar" con Zack en el mapamundi retro.
6. **Enfrentamiento**: persecución por azoteas con **gancho** y **planeador**, combate no letal
   contra el operativo (Tigress, Le Chèvre, El Topo…), robar el botín antes que V.I.L.E.
7. **Cierre**: el botín se deja para ACME con la tarjeta roja de Carmen. Chase llega tarde
   (gag). Se sube de **rango** con títulos del clásico (Rookie → Sleuth → Private Eye →
   Investigator → Ace Detective → …) reinterpretados como rangos del "Equipo Red".

**Reloj**: cada caper tiene un plazo (horas de juego). Viajar a la ciudad equivocada cuesta
tiempo y los testigos "no vieron nada sospechoso", como en 1985.

## 3. Movimiento y gadgets (MVP → posteriores)

| Prioridad | Gadget / acción | Mecánica |
|-----------|-----------------|----------|
| MVP | Correr, saltar, trepar bordes | Controlador en 3ª persona tipo Roblox (WASD + ratón / joystick táctil). |
| MVP | **Gancho de muñeca** | Apuntar a puntos de anclaje resaltados; tirón rápido o balanceo (restricción tipo cuerda). |
| MVP | **Labial hacker** | Interactuar con terminales → minijuego retro (secuencia/cables estilo 8 bits). |
| MVP | **Aretes comunicadores** | Canal de diálogo de Player en el HUD. |
| v2 | **Planeador** | Planeo con descenso lento desde altura. |
| v2 | **Binoculares** | Modo escaneo: resalta pistas y anclajes. |
| v2 | **Cortador láser** | Abrir vitrinas y rejas. |
| v3 | **Dron rojo**, **espejo rastreador** | Exploración remota; seguir a un enemigo marcado. |
| v3 | Artes marciales no letales | Aturdir; esquivar. |

## 4. Contenido por fases

- **MVP (1 caper jugable):** *"El caso del gato de la suerte"* inspirado en San Francisco
  (Chinatown, azoteas, puente) contra **Le Chèvre** y **El Topo**. Incluye tutorial en la
  **Isla de V.I.L.E.** (prólogo: la huida de Black Sheep, enseña movimiento y gancho).
- **v2:** 3 capers más (París, Río de Janeiro, Tokio/Matsumoto) + 1 archivo "clásico" con
  un villano de nombre con juego de palabras.
- **v3:** jefes de la Facultad (Coach Brunt, Condesa Cleo, Dra. Bellum, Maelstrom),
  Buenos Aires / Ciudad de México, persecución de ACME en tiempo real.

## 5. Estilo visual y audio

- **3D estilo Roblox**: personajes de bloques (cabeza, torso, brazos, piernas como cajas con
  texturas simples), ciudades con primitivas y bajo polígono. Carmen: gabardina y sombrero
  rojos; cada operativo reconocible por silueta y color.
- **Capa retro 90s** en la UI: fuente pixelada, paleta VGA, ventanas biseladas, retratos
  pixel art en los diálogos, mapamundi con líneas de vuelo punteadas, pantalla Crime Net
  ámbar, efecto CRT opcional.
- **Audio**: jingles chiptune originales generados con Web Audio (sin música con copyright).
- Todo el arte se crea desde cero (IP: proyecto de fan, aviso en el pie del sitio).

## 6. Arquitectura técnica

| Tema | Decisión |
|------|----------|
| Build | **Vite + TypeScript** (salida estática en `dist/`). |
| 3D | **Three.js**. Modelos por código (cajas) al principio; luego glTF hechos en Blockbench. |
| Física | **Rapier** (`@dimforge/rapier3d-compat`, WASM embebido) para controlador de personaje, colisiones y la cuerda del gancho. |
| UI retro | DOM + CSS superpuesto al canvas (diálogos, Crime Net, mapa, menús). |
| Contenido | **Data-driven**: capers, ciudades, pistas, NPC y operativos en JSON bajo `src/data/`, para que agregar misiones no requiera código. |
| Estado | Máquina de estados simple (Menú → Briefing → Exploración → CrimeNet → Mapa → Jefe → Resultado). Progreso en `localStorage`. |
| Idioma | Español primero; textos en `src/i18n/es.json` para poder sumar inglés. |
| Controles | Teclado/ratón y táctil (joystick virtual) para que funcione en celular. |
| Deploy | **GitHub Actions** → GitHub Pages (`actions/deploy-pages`). `base` de Vite = `/ks-apprender-carmen-sandiego/`. |

### Estructura propuesta

```
index.html
vite.config.ts
.github/workflows/deploy.yml
public/            fuentes pixel, texturas, sonidos
src/
  main.ts          arranque, loop
  core/            estados del juego, input, audio, guardado
  world/           generación de distritos, cámara, iluminación
  player/          controlador de Carmen, animación de bloques
  gadgets/         grapple.ts, lipstick.ts, glider.ts, binoculars.ts …
  npc/             testigos, operativos V.I.L.E., agentes ACME
  missions/        motor de capers, pistas, reloj, Crime Net
  ui/              diálogos, HUD, mapamundi, pantalla Crime Net (CSS retro)
  data/            capers/*.json, cities.json, suspects.json
  i18n/es.json
docs/              PLAN.md, INVESTIGACION.md
```

## 7. Hitos de implementación

1. **Esqueleto**: Vite + TS + Three.js, escena con suelo, deploy a Pages funcionando.
2. **Carmen jugable**: personaje de bloques, cámara 3ª persona, correr/saltar con Rapier, controles táctiles.
3. **Gancho**: puntos de anclaje, raycast, tirón y balanceo.
4. **UI retro**: diálogos con retrato, HUD de Player, fuente pixel, efecto CRT.
5. **Motor de capers**: carga JSON, testigos, pistas, reloj, Crime Net, mapamundi de viaje.
6. **Labial hacker**: minijuego en terminales.
7. **Prólogo Isla de V.I.L.E. + caper San Francisco** completos; enfrentamiento con Le Chèvre.
8. **Pulido**: audio chiptune, guardado, pantalla de rangos, aviso de fan, README.
9. **v2/v3**: planeador, binoculares, láser, nuevas ciudades y jefes.

## 8. Verificación

- `npm run dev` y probar en navegador de escritorio y en emulación móvil.
- `npm run build && npm run preview` para validar rutas con el `base` de Pages.
- Pruebas unitarias (Vitest) del motor de capers: pistas coherentes, destino correcto,
  identificación en Crime Net, reloj.
- Prueba e2e con Playwright (Chromium preinstalado): cargar la página, iniciar el tutorial,
  mover a Carmen, completar un diálogo.
- Tras el push, verificar que el workflow de Pages publique y que el sitio cargue.

## 9. Preguntas abiertas

- ¿Público objetivo y edad? (afecta dificultad de pistas geográficas y combate).
- ¿Solo español o bilingüe desde el inicio?
- ¿Prioridad al componente educativo (geografía, como el original) o a la acción/plataformas?
- ¿Se hará el repositorio público para GitHub Pages (Pages gratuito requiere repo público)?
