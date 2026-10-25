/**
 * Registra el trabajador de `public/sw.js`, que deja instalar el sitio como aplicación, abre al instante lo ya
 * descargado y muestra un aviso propio sin conexión. Solo en el sitio compilado: en desarrollo guardaría
 * archivos que cambian a cada rato.
 */
export const registerServiceWorker = (
  container: ServiceWorkerContainer | undefined = navigator.serviceWorker,
  enabled = import.meta.env.PROD,
) => {
  if (!enabled || !container) return

  // Después de la carga, para no competir con la primera página por la red.
  window.addEventListener('load', () => {
    container.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Sin trabajador el sitio funciona igual: solo no abre sin conexión.
    })
  })
}
