import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import type { RegistrationCredentials } from '@/features/auth/types/auth.types'
import { buildRegistration } from '@/test/factories'

/** Los campos y botones del registro, buscados como los percibe quien usa el formulario. */
export const registrationForm = {
  firstName: () => screen.getByRole('textbox', { name: 'Nombre' }),
  lastName: () => screen.getByRole('textbox', { name: 'Apellido' }),
  email: () => screen.getByRole('textbox', { name: 'Correo' }),
  phone: () => screen.getByRole('textbox', { name: 'Teléfono' }),
  password: () => screen.getByLabelText(/^Contraseña/),
  submitButton: () => screen.getByRole('button', { name: /^Crear cuenta$|Creando cuenta/ }),
  googleButton: () => screen.getByRole('button', { name: /Registrarse con Google|Conectando con Google/ }),
}

/** Pega cada dato de una vez: escribirlos tecla a tecla haría lentas las pruebas. */
export const fillRegistrationForm = async (
  user: UserEvent,
  credentials: RegistrationCredentials = buildRegistration(),
) => {
  const fields = ['firstName', 'lastName', 'email', 'phone', 'password'] as const

  for (const field of fields) {
    await user.click(registrationForm[field]())
    await user.paste(credentials[field])
  }
}
