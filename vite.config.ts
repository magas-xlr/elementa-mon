import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative paths so the same build loads from a web server and from file:// in Electron
  base: './',
  // Hand-made 3D pets (src/assets/pets), imported with ?inline (see render/petModels.ts)
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
