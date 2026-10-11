import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Las librerías van en archivos propios, que cambian solo al actualizarlas: al publicar un cambio del
        // sitio, quien ya lo visitó vuelve a descargar solo el código del sitio. Leaflet no entra: va con el mapa.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/, priority: 3 },
            { name: 'supabase', test: /node_modules[\\/](@supabase|iceberg-js|tslib)[\\/]/, priority: 2 },
            { name: 'ui', test: /node_modules[\\/](@base-ui|@floating-ui|lucide-react)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    // Las pruebas nunca hablan con el proyecto real de Supabase, aunque el equipo tenga un `.env.local`:
    // sin estas variables la aplicación queda sin servicio, y lo que lo necesita usa uno simulado.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_PUBLISHABLE_KEY: '' },
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    restoreMocks: true,
  },
})
