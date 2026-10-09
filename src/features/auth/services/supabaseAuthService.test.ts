import { describe, expect, it, vi } from 'vitest'
import {
  EmailNotConfirmedError,
  EmailTakenError,
  GoogleAccessUnavailableError,
  InvalidCredentialsError,
  RecoveryLinkExpiredError,
  SamePasswordError,
} from '@/features/auth/services/authErrors'
import { createSupabaseAuthService } from '@/features/auth/services/supabaseAuthService'
import type { AccountsClient } from '@/features/auth/services/supabaseAuthService'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { buildRegistration } from '@/test/factories'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const RETURN_URL = 'https://sitio.example/'
const CREDENTIALS: LoginCredentials = { email: 'ana@gmail.com', password: 'secreta123', remember: true }
const PROFILE = { first_name: 'Ana', last_name: 'Mejía', phone: '+50499999999' }
const USER = { email: 'ana@gmail.com', user_metadata: PROFILE, identities: [{}] }
const SESSION = { user: USER }

type SessionListener = Parameters<AccountsClient['onAuthStateChange']>[0]

/** Un fallo como los de Supabase: un error que dice su motivo en `code`. */
const supabaseError = (code: string) => Object.assign(new Error(code), { code })

/** Cuentas de mentira: todo sale bien y el registro queda pendiente de confirmar, salvo que la prueba diga otra cosa. */
const fakeAccounts = () => {
  let notify: SessionListener = () => {}
  const unsubscribe = vi.fn()
  const accounts = {
    signInWithPassword: vi.fn<AccountsClient['signInWithPassword']>(async () => ({ error: null })),
    signUp: vi.fn<AccountsClient['signUp']>(async () => ({ data: { user: USER, session: null }, error: null })),
    signOut: vi.fn<AccountsClient['signOut']>(async () => ({ error: null })),
    resetPasswordForEmail: vi.fn<AccountsClient['resetPasswordForEmail']>(async () => ({ error: null })),
    updateUser: vi.fn<AccountsClient['updateUser']>(async () => ({ error: null })),
    onAuthStateChange: vi.fn<AccountsClient['onAuthStateChange']>((listener) => {
      notify = listener
      return { data: { subscription: { unsubscribe } } }
    }),
  }

  return { accounts, unsubscribe, emit: (session: Parameters<SessionListener>[1]) => notify('SIGNED_IN', session) }
}

interface Arrival {
  /** Si la página se abrió desde el enlace para elegir otra contraseña. */
  cameFromRecoveryLink?: boolean
}

const setup = ({ cameFromRecoveryLink = false }: Arrival = {}) => {
  const fake = fakeAccounts()
  const rememberSession = vi.fn()
  const service = createSupabaseAuthService({
    accounts: fake.accounts,
    rememberSession,
    returnUrl: RETURN_URL,
    cameFromRecoveryLink,
  })

  return { ...fake, rememberSession, service }
}

describe('createSupabaseAuthService: iniciar sesión', () => {
  it('entra con el correo y la contraseña', async () => {
    // Arrange
    const { service, accounts } = setup()

    // Act
    await service.login(CREDENTIALS)

    // Assert
    expect(accounts.signInWithPassword).toHaveBeenCalledExactlyOnceWith({
      email: 'ana@gmail.com',
      password: 'secreta123',
    })
  })

  it.each([true, false])('antes de entrar deja dicho si la sesión se recuerda en el dispositivo (%s)', async (remember) => {
    // Arrange
    const { service, accounts, rememberSession } = setup()

    // Act
    await service.login({ ...CREDENTIALS, remember })

    // Assert
    expect(rememberSession).toHaveBeenCalledExactlyOnceWith(remember)
    expect(rememberSession.mock.invocationCallOrder[0]).toBeLessThan(
      accounts.signInWithPassword.mock.invocationCallOrder[0],
    )
  })

  it.each([
    { code: 'invalid_credentials', ErrorClass: InvalidCredentialsError, when: 'el correo o la contraseña no coinciden' },
    { code: 'email_not_confirmed', ErrorClass: EmailNotConfirmedError, when: 'falta confirmar el correo' },
  ])('rechaza con $ErrorClass.name cuando $when', async ({ code, ErrorClass }) => {
    // Arrange
    const { service, accounts } = setup()
    accounts.signInWithPassword.mockResolvedValue({ error: supabaseError(code) })

    // Act
    const login = service.login(CREDENTIALS)

    // Assert
    await expect(login).rejects.toBeInstanceOf(ErrorClass)
  })

  it('ante cualquier otro fallo rechaza con ese mismo fallo, sin culpar a los datos escritos', async () => {
    // Arrange
    const { service, accounts } = setup()
    const failure = supabaseError('unexpected_failure')
    accounts.signInWithPassword.mockResolvedValue({ error: failure })

    // Act
    const login = service.login(CREDENTIALS)

    // Assert
    await expect(login).rejects.toBe(failure)
  })

  it('entrar con Google se rechaza como no disponible todavía, en lugar de fingirlo', async () => {
    // Arrange
    const { service } = setup()

    // Act
    const login = service.loginWithGoogle()

    // Assert
    await expect(login).rejects.toBeInstanceOf(GoogleAccessUnavailableError)
  })
})

describe('createSupabaseAuthService: crear una cuenta', () => {
  it('registra el correo y la contraseña, guarda el perfil y pide que el enlace de confirmación vuelva al sitio', async () => {
    // Arrange
    const { service, accounts } = setup()
    const registration = buildRegistration()

    // Act
    await service.register(registration, TEST_OPERATION_KEY)

    // Assert
    expect(accounts.signUp).toHaveBeenCalledExactlyOnceWith({
      email: registration.email,
      password: registration.password,
      options: {
        data: { first_name: registration.firstName, last_name: registration.lastName, phone: registration.phone },
        emailRedirectTo: RETURN_URL,
      },
    })
  })

  it('avisa de que falta confirmar el correo cuando la cuenta se crea sin sesión', async () => {
    // Arrange
    const { service } = setup()

    // Act
    const outcome = await service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    expect(outcome).toBe('confirmationPending')
  })

  it('avisa de que la persona ya está dentro cuando la cuenta se crea con sesión', async () => {
    // Arrange
    const { service, accounts } = setup()
    accounts.signUp.mockResolvedValue({ data: { user: USER, session: SESSION }, error: null })

    // Act
    const outcome = await service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    expect(outcome).toBe('signedIn')
  })

  it.each([
    { when: 'Supabase lo dice', answer: { data: { user: null, session: null }, error: supabaseError('user_already_exists') } },
    { when: 'Supabase lo dice con su otro código', answer: { data: { user: null, session: null }, error: supabaseError('email_exists') } },
    { when: 'Supabase lo calla y devuelve una cuenta sin identidades', answer: { data: { user: { ...USER, identities: [] }, session: null }, error: null } },
  ])('rechaza con EmailTakenError si el correo ya tiene cuenta y $when', async ({ answer }) => {
    // Arrange
    const { service, accounts } = setup()
    accounts.signUp.mockResolvedValue(answer)

    // Act
    const registration = service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    await expect(registration).rejects.toBeInstanceOf(EmailTakenError)
  })

  it('ante cualquier otro fallo rechaza con ese mismo fallo', async () => {
    // Arrange
    const { service, accounts } = setup()
    const failure = supabaseError('over_email_send_rate_limit')
    accounts.signUp.mockResolvedValue({ data: { user: null, session: null }, error: failure })

    // Act
    const registration = service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    await expect(registration).rejects.toBe(failure)
  })

  it('repetir el registro con la misma clave no lo pide dos veces y da el mismo resultado', async () => {
    // Arrange
    const { service, accounts } = setup()
    const first = await service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Act
    const second = await service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    expect(accounts.signUp).toHaveBeenCalledOnce()
    expect(second).toBe(first)
  })

  it('reintentar con la misma clave un registro que falló lo pide de nuevo', async () => {
    // Arrange
    const { service, accounts } = setup()
    accounts.signUp.mockResolvedValueOnce({ data: { user: null, session: null }, error: supabaseError('unexpected_failure') })
    await service.register(buildRegistration(), TEST_OPERATION_KEY).catch(() => {})

    // Act
    const outcome = await service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    expect(accounts.signUp).toHaveBeenCalledTimes(2)
    expect(outcome).toBe('confirmationPending')
  })
})

describe('createSupabaseAuthService: recuperar la contraseña', () => {
  it('pide que se envíe el enlace al correo y dice a dónde debe volver quien lo abra', async () => {
    // Arrange
    const { service, accounts } = setup()

    // Act
    await service.requestPasswordReset('ana@gmail.com')

    // Assert
    expect(accounts.resetPasswordForEmail).toHaveBeenCalledExactlyOnceWith('ana@gmail.com', { redirectTo: RETURN_URL })
  })

  it('si el enlace no se pudo enviar, lo rechaza con ese fallo', async () => {
    // Arrange
    const { service, accounts } = setup()
    const failure = supabaseError('over_email_send_rate_limit')
    accounts.resetPasswordForEmail.mockResolvedValue({ error: failure })

    // Act
    const request = service.requestPasswordReset('ana@gmail.com')

    // Assert
    await expect(request).rejects.toBe(failure)
  })

  it.each([true, false])('dice si la persona llegó desde el enlace de recuperación (%s)', (cameFromRecoveryLink) => {
    // Arrange
    const { service } = setup({ cameFromRecoveryLink })

    // Act
    const recovering = service.isRecoveringPassword()

    // Assert
    expect(recovering).toBe(cameFromRecoveryLink)
  })

  it('guarda la contraseña nueva de quien llegó desde el enlace', async () => {
    // Arrange
    const { service, accounts } = setup({ cameFromRecoveryLink: true })

    // Act
    await service.changePassword('otra-secreta-456', TEST_OPERATION_KEY)

    // Assert
    expect(accounts.updateUser).toHaveBeenCalledExactlyOnceWith({ password: 'otra-secreta-456' })
  })

  it('no cambia la contraseña de quien no llegó desde el enlace, aunque tenga la sesión abierta', async () => {
    // Arrange
    const { service, accounts } = setup({ cameFromRecoveryLink: false })

    // Act
    const change = service.changePassword('otra-secreta-456', TEST_OPERATION_KEY)

    // Assert
    await expect(change).rejects.toBeInstanceOf(RecoveryLinkExpiredError)
    expect(accounts.updateUser).not.toHaveBeenCalled()
  })

  it('rechaza con SamePasswordError si la contraseña nueva es la misma de antes', async () => {
    // Arrange
    const { service, accounts } = setup({ cameFromRecoveryLink: true })
    accounts.updateUser.mockResolvedValue({ error: supabaseError('same_password') })

    // Act
    const change = service.changePassword('secreta123', TEST_OPERATION_KEY)

    // Assert
    await expect(change).rejects.toBeInstanceOf(SamePasswordError)
  })

  it('ante cualquier otro fallo al guardarla rechaza con ese mismo fallo', async () => {
    // Arrange
    const { service, accounts } = setup({ cameFromRecoveryLink: true })
    const failure = supabaseError('unexpected_failure')
    accounts.updateUser.mockResolvedValue({ error: failure })

    // Act
    const change = service.changePassword('otra-secreta-456', TEST_OPERATION_KEY)

    // Assert
    await expect(change).rejects.toBe(failure)
  })

  it('repetir el cambio con la misma clave no lo pide dos veces', async () => {
    // Arrange
    const { service, accounts } = setup({ cameFromRecoveryLink: true })
    await service.changePassword('otra-secreta-456', TEST_OPERATION_KEY)

    // Act
    await service.changePassword('otra-secreta-456', TEST_OPERATION_KEY)

    // Assert
    expect(accounts.updateUser).toHaveBeenCalledOnce()
  })
})

describe('createSupabaseAuthService: datos de la cuenta', () => {
  const CORRECTED = { firstName: 'Ana María', lastName: 'Mejía', phone: '+50488880000' }

  it('guarda el nombre, el apellido y el teléfono de quien tiene la sesión', async () => {
    // Arrange
    const { service, accounts } = setup()

    // Act
    await service.updateProfile(CORRECTED)

    // Assert
    expect(accounts.updateUser).toHaveBeenCalledExactlyOnceWith({
      data: { first_name: 'Ana María', last_name: 'Mejía', phone: '+50488880000' },
    })
  })

  it('si no se pudieron guardar, lo rechaza con ese fallo', async () => {
    // Arrange
    const { service, accounts } = setup()
    const failure = supabaseError('unexpected_failure')
    accounts.updateUser.mockResolvedValue({ error: failure })

    // Act
    const saving = service.updateProfile(CORRECTED)

    // Assert
    await expect(saving).rejects.toBe(failure)
  })
})

describe('createSupabaseAuthService: cerrar sesión', () => {
  it('cierra la sesión de este dispositivo, sin cerrar las de otros', async () => {
    // Arrange
    const { service, accounts } = setup()

    // Act
    await service.logout()

    // Assert
    expect(accounts.signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'local' })
  })

  it('si no se pudo cerrar, lo rechaza para que la persona sepa que sigue dentro', async () => {
    // Arrange
    const { service, accounts } = setup()
    const failure = supabaseError('sin conexión')
    accounts.signOut.mockResolvedValue({ error: failure })

    // Act
    const logout = service.logout()

    // Assert
    await expect(logout).rejects.toBe(failure)
  })
})

describe('createSupabaseAuthService: quién tiene la sesión', () => {
  it('avisa de quién entró, con su nombre y su correo', () => {
    // Arrange
    const { service, emit } = setup()
    const listener = vi.fn()
    service.onSessionChange(listener)

    // Act
    emit(SESSION)

    // Assert
    expect(listener).toHaveBeenCalledExactlyOnceWith({
      email: 'ana@gmail.com',
      firstName: 'Ana',
      lastName: 'Mejía',
      phone: '+50499999999',
    })
  })

  it('avisa de que no hay nadie cuando la sesión se cierra', () => {
    // Arrange
    const { service, emit } = setup()
    const listener = vi.fn()
    service.onSessionChange(listener)

    // Act
    emit(null)

    // Assert
    expect(listener).toHaveBeenCalledExactlyOnceWith(null)
  })

  it('una cuenta sin nombre guardado se entrega con el nombre vacío, no con un dato inventado', () => {
    // Arrange
    const { service, emit } = setup()
    const listener = vi.fn()
    service.onSessionChange(listener)

    // Act
    emit({ user: { ...USER, user_metadata: {} } })

    // Assert
    expect(listener).toHaveBeenCalledExactlyOnceWith({ email: 'ana@gmail.com', firstName: '', lastName: '', phone: '' })
  })

  it('al dejar de escuchar, se da de baja de los avisos', () => {
    // Arrange
    const { service, unsubscribe } = setup()
    const stopListening = service.onSessionChange(vi.fn())

    // Act
    stopListening()

    // Assert
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
