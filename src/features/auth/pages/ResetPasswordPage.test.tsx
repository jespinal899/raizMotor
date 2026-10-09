import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import { SamePasswordError } from '@/features/auth/services/authErrors'
import { authService } from '@/features/auth/services/authService'
import type { SessionUser } from '@/features/auth/types/auth.types'
import { MIN_PASSWORD_LENGTH } from '@/features/auth/utils/credentialRules'
import { BRAND } from '@/shared/constants/brand'
import { buildSessionUser } from '@/test/factories'
import { anyOperationKey } from '@/test/operationKey'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

vi.mock('@/features/auth/services/authService', () => ({
  authService: { isRecoveringPassword: vi.fn(), onSessionChange: vi.fn(), changePassword: vi.fn() },
}))

const isRecoveringPassword = vi.mocked(authService.isRecoveringPassword)
const changePassword = vi.mocked(authService.changePassword)

const RESET_PATH = '/restablecer-contrasena'
const INVALID_LINK = 'El enlace ya no es válido'

const renderPage = () => renderWithRouter(<ResetPasswordPage />, { route: RESET_PATH, path: RESET_PATH })

/** Abre la página como quien llega desde el enlace de su correo, con la sesión que ese enlace le dio. */
const arriveFromLink = (session: SessionUser | null = buildSessionUser()) => {
  isRecoveringPassword.mockReturnValue(true)
  sessionIs(session)

  return renderPage()
}

const passwordField = () => screen.getByLabelText(/^Nueva contraseña/)
const saveButton = () => screen.getByRole('button', { name: /^Guardar contraseña$|Guardando/ })

const save = async (password: string) => {
  const user = userEvent.setup()
  await user.type(passwordField(), password)
  await user.click(saveButton())
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    isRecoveringPassword.mockReset()
    changePassword.mockReset()
    vi.mocked(authService.onSessionChange).mockReset()
  })

  it('a quien no llega desde el enlace le dice que ya no es válido, y no le pide ninguna contraseña', () => {
    // Arrange
    isRecoveringPassword.mockReturnValue(false)
    sessionIs(buildSessionUser())

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: INVALID_LINK })).toBeInTheDocument()
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument()
  })

  it('le ofrece pedir otro enlace o iniciar sesión', () => {
    // Arrange
    isRecoveringPassword.mockReturnValue(false)
    const expectedLinks = ['Pedir otro enlace → /recuperar-contrasena', 'Iniciar sesión → /iniciar-sesion']

    // Act
    renderPage()

    // Assert
    const links = screen.getAllByRole('link').map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(links).toEqual(expectedLinks)
  })

  it('si el enlace no dejó ninguna sesión abierta, también dice que ya no es válido', () => {
    // Arrange: el enlace llegó, pero el servicio no lo aceptó

    // Act
    arriveFromLink(null)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: INVALID_LINK })).toBeInTheDocument()
  })

  it('mientras se comprueba el enlace no afirma todavía que no sea válido', () => {
    // Arrange: el servicio aún no ha dicho si el enlace dejó una sesión
    isRecoveringPassword.mockReturnValue(true)

    // Act
    renderPage()

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: INVALID_LINK })).not.toBeInTheDocument()
  })

  it('a quien llega desde el enlace le pide su contraseña nueva y pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Elegir otra contraseña | ${BRAND.name}`

    // Act
    arriveFromLink()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Elige otra contraseña' })).toBeInTheDocument()
    expect(screen.getByLabelText(`Nueva contraseña (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`)).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('guarda la contraseña escrita y confirma que ya se entra con ella', async () => {
    // Arrange
    changePassword.mockResolvedValue(undefined)
    arriveFromLink()

    // Act
    await save('otra-secreta-456')

    // Assert
    const notice = await screen.findByRole('status')
    expect(changePassword).toHaveBeenCalledExactlyOnceWith('otra-secreta-456', anyOperationKey())
    expect(notice).toHaveTextContent('Contraseña actualizada')
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/')
  })

  it('no guarda una contraseña más corta de lo exigido, y dice cuántos caracteres hacen falta', async () => {
    // Arrange
    arriveFromLink()

    // Act
    await save('corta')

    // Assert
    expect(changePassword).not.toHaveBeenCalled()
    expect(passwordField()).toHaveAccessibleDescription(`Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  })

  it('si la contraseña es la misma de antes pide elegir otra', async () => {
    // Arrange
    changePassword.mockRejectedValue(new SamePasswordError())
    arriveFromLink()

    // Act
    await save('la-misma-de-antes')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Elige una distinta de la anterior.')
    expect(saveButton()).toBeEnabled()
  })
})
