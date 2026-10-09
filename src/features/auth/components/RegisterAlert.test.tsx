import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RegisterAlert from '@/features/auth/components/RegisterAlert'
import { BRAND } from '@/shared/constants/brand'

describe('RegisterAlert', () => {
  it.each(['idle', 'submitting', 'connecting'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: todavía no hay resultado

    // Act
    const { container } = render(<RegisterAlert status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('cuando el registro aún no está activo lo dice y deja claro que no se creó ninguna cuenta', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<RegisterAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('El registro aún no está disponible')
    expect(alert).toHaveTextContent(`Estamos preparando las cuentas de ${BRAND.name}. No se creó ninguna cuenta.`)
  })

  it('cuando el correo ya tiene cuenta lo dice y propone iniciar sesión', () => {
    // Arrange
    const status = 'taken'

    // Act
    render(<RegisterAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Ya existe una cuenta con ese correo')
    expect(alert).toHaveTextContent('Inicia sesión con él o regístrate con otro correo.')
  })

  it('cuando Google aún no está conectado lo dice y recuerda que se puede registrar con el correo', () => {
    // Arrange
    const status = 'googleUnavailable'

    // Act
    render(<RegisterAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('El registro con Google aún no está disponible')
    expect(alert).toHaveTextContent('Por ahora, crea tu cuenta con tu correo.')
  })

  it('ante un fallo del servicio invita a reintentar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<RegisterAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Algo salió mal')
    expect(alert).toHaveTextContent('No pudimos crear tu cuenta. Inténtalo de nuevo en unos minutos.')
  })
})
