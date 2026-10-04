import { useEffect, useRef, useState } from 'react'

const INVALID = '[aria-invalid="true"]'
const FOCUSABLE = 'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'

const findFocusTarget = (container: HTMLElement): HTMLElement | null => {
  const invalid = container.querySelector<HTMLElement>(INVALID)
  if (!invalid) return null

  // El error puede estar en un grupo (opciones, mapa, fotos): se enfoca su primer control.
  return invalid.matches(FOCUSABLE) ? invalid : invalid.querySelector<HTMLElement>(FOCUSABLE)
}

/** Tras un intento de envío, lleva el foco al primer campo con error para que no pase desapercibido. */
export const useInvalidFieldFocus = <Container extends HTMLElement>() => {
  const containerRef = useRef<Container>(null)
  const [attempts, setAttempts] = useState(0)

  // En un efecto y no al instante: los errores del intento deben estar ya pintados.
  useEffect(() => {
    if (attempts === 0 || !containerRef.current) return

    findFocusTarget(containerRef.current)?.focus()
  }, [attempts])

  const focusFirstInvalid = () => setAttempts((count) => count + 1)

  return { containerRef, focusFirstInvalid }
}
