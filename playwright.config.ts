import { defineConfig, devices } from '@playwright/test'

/**
 * Pruebas de punta a punta: recorren el sitio compilado, en un navegador de verdad, contra un Supabase local
 * con todas las migraciones (`supabase start`). El sitio se compila antes con las variables de ese Supabase:
 * así se ejecutan en el CI y en el README se explica cómo correrlas en tu equipo.
 */
export default defineConfig({
  testDir: './e2e',
  // Cada archivo comparte cuentas y anuncios entre sus pasos: sus pruebas van en orden.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'es-HN',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
