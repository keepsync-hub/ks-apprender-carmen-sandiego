# Carmen Sandiego: ¡Ladrona de ladrones!

Juego de fans, educativo y sin fines de lucro, para niñas y niños de 6 a 9 años.
Juegas como **Carmen Sandiego** (serie de Netflix) en un mundo 3D de bloques estilo Roblox,
sigues pistas geográficas como en el clásico de los 90 y usas sus gadgets: gancho, labial
hacker, planeador y más.

## Aprende inglés jugando

Con la misma dinámica de [Aprender Jugando 3D](https://github.com/keepsync-hub/ks-apprender-3d),
cada vez que **pides una pista a un testigo** y cada vez que **atrapas al ladrón** (el tesoro
está en un cofre cuya clave es una palabra) aprendes una **palabra en inglés**: te dicen la
palabra y una pista que no da la respuesta, y tú deduces qué significa. Si te equivocas, esa
opción se apaga y vuelves a intentarlo. Aprendiz elige entre 2 opciones con dibujo; Detective
entre 4, solo con texto. Las palabras están en `src/data/palabras.ts`; primero se enseñan las
nuevas y, cuando ya sabes todas, se repasan las de menor dominio (⭐ a ⭐⭐⭐).

## Estilo visual

Estilo Roblox: piezas de plástico con *studs* en el suelo y las azoteas, personajes con cabeza
cilíndrica y la carita sonriente clásica, testigos con los colores del «noob» y una interfaz
de paneles redondeados con botones gruesos (letra Fredoka). Todo se dibuja en el navegador,
sin imágenes externas.

- Plan del proyecto: [`docs/PLAN.md`](docs/PLAN.md)
- Investigación del universo: [`docs/INVESTIGACION.md`](docs/INVESTIGACION.md)

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # verifica tipos y genera dist/
npm run preview  # prueba el build con la ruta de GitHub Pages
```

## Publicación

Cada PR compila y verifica el juego; cada merge a `main` lo publica con GitHub Actions
(`.github/workflows/deploy.yml`). Requiere, una sola vez, activar en
**Settings → Pages → Source: GitHub Actions**.

---

Carmen Sandiego es marca de sus respectivos dueños. Todo el arte, la música y el código de
este repositorio son originales.
