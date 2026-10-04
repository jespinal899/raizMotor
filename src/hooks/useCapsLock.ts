import { useState } from 'react'
import type { KeyboardEvent } from 'react'

/** Detecta Bloq Mayús mientras se escribe en un campo y deja de avisar al salir de él. */
export const useCapsLock = () => {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const track = (event: KeyboardEvent) => setIsCapsLockOn(event.getModifierState('CapsLock'))
  const reset = () => setIsCapsLockOn(false)

  return { isCapsLockOn, capsLockHandlers: { onKeyDown: track, onKeyUp: track, onBlur: reset } }
}
