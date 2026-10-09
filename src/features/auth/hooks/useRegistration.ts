import { useState } from 'react'
import { useEnter } from '@/features/auth/hooks/useEnter'
import { authService } from '@/features/auth/services/authService'
import type { AuthService } from '@/features/auth/services/authService'
import type { RegistrationCredentials } from '@/features/auth/types/auth.types'

/**
 * Crear una cuenta deja a la persona dentro o, si antes debe confirmar su correo, a la espera del enlace
 * que se le envió: `confirmationEmail` dice a qué dirección.
 */
export const useRegistration = (service: AuthService = authService) => {
  const enter = useEnter()
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)

  const register = (credentials: RegistrationCredentials, operationKey: string) =>
    enter(async () => {
      const outcome = await service.register(credentials, operationKey)
      if (outcome === 'confirmationPending') setConfirmationEmail(credentials.email)

      return outcome
    })

  // Con Google, registrarse e iniciar sesión son la misma operación: la cuenta se crea al entrar por primera vez.
  const registerWithGoogle = () => enter(() => service.loginWithGoogle())

  return { confirmationEmail, register, registerWithGoogle }
}
