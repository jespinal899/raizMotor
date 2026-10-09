import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccountPage from '@/features/auth/pages/AccountPage'
import { authService } from '@/features/auth/services/authService'
import { BRAND } from '@/shared/constants/brand'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

vi.mock('@/features/auth/services/authService', () => ({
  authService: { onSessionChange: vi.fn(), updateProfile: vi.fn() },
}))

const updateProfile = vi.mocked(authService.updateProfile)

const ANA = buildSessionUser({ firstName: 'Ana', lastName: 'Mejía', phone: '+50499999999', email: 'ana@gmail.com' })

const renderPage = () => renderWithRouter(<AccountPage />, { route: '/mi-cuenta', path: '/mi-cuenta' })

const field = (name: string) => screen.getByRole('textbox', { name })
const saveButton = () => screen.getByRole('button', { name: /^Guardar cambios$|Guardando/ })

describe('AccountPage', () => {
  beforeEach(() => {
    vi.mocked(authService.onSessionChange).mockReset()
    updateProfile.mockReset()
    sessionIs(ANA)
  })

  it('muestra los datos de la cuenta y pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Mi cuenta | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Mi cuenta' })).toBeInTheDocument()
    expect(field('Nombre')).toHaveValue('Ana')
    expect(field('Apellido')).toHaveValue('Mejía')
    expect(field('Teléfono')).toHaveValue('9999-9999')
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('enseña el correo de la cuenta, que no se cambia desde aquí', () => {
    // Arrange: cuenta de Ana

    // Act
    renderPage()

    // Assert
    expect(screen.getByText('ana@gmail.com')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Correo' })).not.toBeInTheDocument()
  })

  it('guarda el teléfono corregido y dice que sus anuncios ya lo muestran', async () => {
    // Arrange
    const user = userEvent.setup()
    updateProfile.mockResolvedValue(undefined)
    renderPage()
    await user.clear(field('Teléfono'))
    await user.type(field('Teléfono'), '88880000')

    // Act
    await user.click(saveButton())

    // Assert
    const notice = await screen.findByRole('status')
    expect(updateProfile).toHaveBeenCalledExactlyOnceWith({ firstName: 'Ana', lastName: 'Mejía', phone: '+50488880000' })
    expect(notice).toHaveTextContent('Tus datos se guardaron')
    expect(notice).toHaveTextContent('Tus anuncios ya muestran el nombre y el teléfono nuevos.')
  })

  it('si no se pudieron guardar lo avisa y deja reintentar', async () => {
    // Arrange
    const user = userEvent.setup()
    updateProfile.mockRejectedValue(new Error('sin conexión'))
    renderPage()

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar tus datos')
    expect(saveButton()).toBeEnabled()
  })

  it('sin nadie con la sesión abierta no enseña ningún formulario: no hay cuenta que mostrar', () => {
    // Arrange: como en una compilación sin servicio de cuentas, donde la página no exige sesión
    sessionIs(null)

    // Act
    renderPage()

    // Assert
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Tu cuenta aún no está disponible' })).toBeInTheDocument()
  })
})
