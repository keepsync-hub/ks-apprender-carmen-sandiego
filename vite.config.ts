import { defineConfig } from 'vite';

// GitHub Pages sirve el sitio en /<nombre-del-repo>/
export default defineConfig({
  base: '/ks-apprender-carmen-sandiego/',
  // Three.js ocupa ~500 kB por sí solo; es esperado.
  build: { chunkSizeWarningLimit: 800 },
});
