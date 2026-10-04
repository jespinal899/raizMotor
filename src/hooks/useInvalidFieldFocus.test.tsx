import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useInvalidFieldFocus } from '@/hooks/useInvalidFieldFocus'

/** Formulario mínimo: el botón dispara el foco como lo haría un intento de envío fallido. */
const Probe = ({ children }: { children: ReactNode }) => {
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLDivElement>()

  return (
    <div ref={containerRef}>
      {children}
      <button type="button" onClick={focusFirstInvalid}>
        Enviar
      </button>
    </div>
  )
}

const submit = () => userEvent.setup().click(screen.getByRole('button', { name: 'Enviar' }))

describe('useInvalidFieldFocus', () => {
  it('lleva el foco al primer campo con error, saltándose los válidos', async () => {
    // Arrange
    render(
      <Probe>
        <input aria-label="Ciudad" aria-invalid="false" />
        <input aria-label="Dirección" aria-invalid="true" />
        <input aria-label="Precio" aria-invalid="true" />
      </Probe>,
    )

    // Act
    await submit()

    // Assert
    expect(screen.getByRole('textbox', { name: 'Dirección' })).toHaveFocus()
  })

  it('si el error está en un grupo, enfoca su primer control', async () => {
    // Arrange
    render(
      <Probe>
        <div role="radiogroup" aria-label="Operación" aria-invalid="true">
          <button type="button">Venta</button>
          <button type="button">Alquiler</button>
        </div>
      </Probe>,
    )

    // Act
    await submit()

    // Assert
    expect(screen.getByRole('button', { name: 'Venta' })).toHaveFocus()
  })

  it('sin errores deja el foco donde estaba', async () => {
    // Arrange
    render(
      <Probe>
        <input aria-label="Ciudad" aria-invalid="false" />
      </Probe>,
    )

    // Act
    await submit()

    // Assert
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveFocus()
  })

  it('vuelve a enfocar en cada intento, aunque el campo sea el mismo', async () => {
    // Arrange
    const user = userEvent.setup()
    render(
      <Probe>
        <input aria-label="Ciudad" aria-invalid="true" />
      </Probe>,
    )
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    // Assert
    expect(screen.getByRole('textbox', { name: 'Ciudad' })).toHaveFocus()
  })
})
