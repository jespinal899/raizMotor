import { useSyncExternalStore } from 'react'

/** Por encima de `1` la página está ampliada. El margen descuenta el redondeo con que la informa el navegador. */
const ZOOMED_SCALE = 1.01

const subscribe = (onChange: () => void) => {
  const viewport = window.visualViewport
  viewport?.addEventListener('resize', onChange)

  return () => viewport?.removeEventListener('resize', onChange)
}

const isPageZoomed = () => (window.visualViewport?.scale ?? 1) > ZOOMED_SCALE

/**
 * Si la página está ampliada con el gesto de dos dedos, que es cuando un dedo sirve para recorrerla. El
 * zoom del navegador (Ctrl y +) no cuenta: ese agranda el contenido, pero no hay nada que recorrer.
 */
export const useIsPageZoomed = (): boolean => useSyncExternalStore(subscribe, isPageZoomed)
