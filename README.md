# Carmen Sandiego: ¡Ladrona de ladrones!

Juego de fans, educativo y sin fines de lucro, para niñas y niños de 6 a 9 años.
Juegas como **Carmen Sandiego** (serie de Netflix) en un mundo 3D de bloques estilo Roblox,
sigues pistas geográficas como en el clásico de los 90 y usas sus gadgets: gancho, labial
hacker, planeador y más.

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

Cada push a `main` publica el sitio con GitHub Actions
(`.github/workflows/deploy.yml`). Requiere, una sola vez, activar en
**Settings → Pages → Source: GitHub Actions**.

---

Carmen Sandiego es marca de sus respectivos dueños. Todo el arte, la música y el código de
este repositorio son originales.
