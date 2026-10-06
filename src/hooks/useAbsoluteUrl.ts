import { useHref } from 'react-router-dom'

/**
 * Dirección completa de una ruta de la aplicación, lista para abrirse desde fuera (compartirla o citarla
 * en un mensaje). `useHref` añade el prefijo bajo el que está publicado el sitio.
 */
export const useAbsoluteUrl = (path: string): string => {
  const href = useHref(path)

  return new URL(href, window.location.origin).href
}
