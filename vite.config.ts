import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
