/** La clase con la que el CSS reconoce el sitio abierto como aplicación (variante `standalone:`). */
export const INSTALLED_APP_CLASS = 'app-instalada'

/**
 * Safari en el iPhone avisa con `navigator.standalone` que se abrió desde la pantalla de inicio, aunque las
 * versiones viejas no entienden la consulta `display-mode`: se deja la clase en <html> para que el CSS lo sepa.
 */
export const markInstalledApp = (nav: Navigator = navigator, root: HTMLElement = document.documentElement) => {
  if ((nav as Navigator & { standalone?: boolean }).standalone === true) root.classList.add(INSTALLED_APP_CLASS)
}
