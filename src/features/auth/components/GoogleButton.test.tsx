import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GoogleButton from '@/features/auth/components/GoogleButton'

interface Overrides {
  isConnecting?: boolean
  disabled?: boolean
}

const setup = ({ isConnecting = false, disabled }: Overrides = {}) => {
  const onClick = vi.fn()
  render(
    <GoogleButton isConnecting={isConnecting} disabled={disabled} onClick={onClick}>
      Registrarse con Google
    </GoogleButton>,
  )

  return { onClick }
}

describe('GoogleButton', () => {
  it('es un botón que no envía el formulario y avisa al pulsarlo', async () => {
    // Arrange
    const { onClick } = setup()
    const button = screen.getByRole('button', { name: 'Registrarse con Google' })

    // Act
    await userEvent.setup().click(button)

    // Assert
    expect(button).toHaveAttribute('type', 'button')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('el logotipo de Google es decorativo: el nombre del botón es solo su texto', () => {
    // Arrange: botón en reposo

    // Act
    setup()

    // Assert
    const button = screen.getByRole('button', { name: 'Registrarse con Google' })
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('mientras conecta con Google lo indica y no deja repetir', () => {
    // Arrange
    const isConnecting = true

    // Act
    setup({ isConnecting })

    // Assert
    expect(screen.getByRole('button', { name: 'Conectando con Google…' })).toBeDisabled()
  })

  it('se puede desactivar mientras la otra forma de entrar está en curso', () => {
    // Arrange
    const disabled = true

    // Act
    setup({ disabled })

    // Assert
    expect(screen.getByRole('button', { name: 'Registrarse con Google' })).toBeDisabled()
  })
})
