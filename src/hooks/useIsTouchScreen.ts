import { useSyncExternalStore } from 'react'

/** Una pantalla que se maneja con el dedo: el puntero principal es poco preciso, como en un teléfono. */
const TOUCH_SCREEN = '(pointer: coarse)'

const query = () => (typeof window.matchMedia === 'function' ? window.matchMedia(TOUCH_SCREEN) : undefined)

const subscribe = (onChange: () => void) => {
  const media = query()
  media?.addEventListener('change', onChange)

  return () => media?.removeEventListener('change', onChange)
}

const isTouchScreen = () => query()?.matches ?? false

/** Si la pantalla se maneja con el dedo (teléfono o tableta) y no con un ratón. */
export const useIsTouchScreen = (): boolean => useSyncExternalStore(subscribe, isTouchScreen)
