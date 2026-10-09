import { KeyRound } from 'lucide-react'
import AuthCard from '@/features/auth/components/AuthCard'
import AuthPendingPage from '@/features/auth/components/AuthPendingPage'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm'
import { ACCOUNTS_AVAILABLE, authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'Recuperar contraseña'
const LOGIN_ALTERNATIVE = { question: '¿La recordaste?', action: 'Inicia sesión', to: ROUTES.login }

const ForgotPasswordPage = () => {
  usePageTitle(TITLE)

  // Sin el servicio de cuentas no hay quien envíe el enlace: se dice antes de pedir un correo al que no se escribiría.
  if (!ACCOUNTS_AVAILABLE) {
    return (
      <AuthPendingPage
        icon={KeyRound}
        title={TITLE}
        description="La recuperación de contraseña aún no está disponible. Si necesitas ayuda para entrar, contáctanos."
      />
    )
  }

  return (
    <AuthCard
      title={TITLE}
      description="Escribe tu correo y te enviaremos un enlace para elegir otra contraseña."
      alternative={LOGIN_ALTERNATIVE}
    >
      <ForgotPasswordForm onSubmit={(email) => authService.requestPasswordReset(email)} />
    </AuthCard>
  )
}

export default ForgotPasswordPage
