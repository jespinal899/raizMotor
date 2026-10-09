import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoginAlert from '@/features/auth/components/LoginAlert'
import { BRAND } from '@/shared/constants/brand'

describe('LoginAlert', () => {
  it.each(['idle', 'submitting'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: todavía no hay resultado

    // Act
    const { container } = render(<LoginAlert status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('cuando las cuentas aún no están activas lo dice, sin culpar a los datos escritos', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<LoginAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('El inicio de sesión aún no está disponible')
    expect(alert).toHaveTextContent(`Estamos preparando las cuentas de ${BRAND.name}. Si necesitas ayuda, contáctanos.`)
    expect(alert).not.toHaveTextContent('no son correctos')
  })

  it('cuando las credenciales se rechazan no revela cuál de los dos datos falló', () => {
    // Arrange
    const status = 'rejected'

    // Act
    render(<LoginAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos iniciar tu sesión')
    expect(alert).toHaveTextContent('El correo o la contraseña no son correctos.')
  })

  it('cuando falta confirmar el correo dice qué hacer, sin culpar a la contraseña', () => {
    // Arrange
    const status = 'unconfirmed'

    // Act
    render(<LoginAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Confirma tu correo para entrar')
    expect(alert).toHaveTextContent('Abre el enlace que te enviamos al registrarte')
    expect(alert).not.toHaveTextContent('no son correctos')
  })

  it('cuando Google aún no está conectado lo dice y recuerda que se puede entrar con el correo', () => {
    // Arrange
    const status = 'googleUnavailable'

    // Act
    render(<LoginAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('El acceso con Google aún no está disponible')
    expect(alert).toHaveTextContent('Por ahora, inicia sesión con tu correo y tu contraseña.')
  })

  it('ante un fallo del servicio invita a reintentar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<LoginAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Algo salió mal')
    expect(alert).toHaveTextContent('No pudimos iniciar tu sesión. Inténtalo de nuevo en unos minutos.')
  })
})
