import { KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '@/features/auth/components/AuthCard'
import AuthPendingPage from '@/features/auth/components/AuthPendingPage'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm'
import { ACCOUNTS_AVAILABLE, authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'
import { PASSWORD_UPDATED_NOTICE } from '@/shared/constants/notices'

const TITLE = 'Recuperar contraseña'
const LOGIN_ALTERNATIVE = { question: '¿La recordaste?', action: 'Inicia sesión', to: ROUTES.login }

const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  usePageTitle(TITLE)

  // Sin el servicio de cuentas no hay quien envíe el código: se dice antes de pedir un correo al que no se escribiría.
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
      description="Te enviaremos un código de verificación para que puedas actualizar tu contraseña."
      alternative={LOGIN_ALTERNATIVE}
    >
      <ForgotPasswordForm
        onSubmit={(email) => authService.requestPasswordReset(email)}
        onReset={async (reset, operationKey) => {
          await authService.resetPassword(reset, operationKey)
          // La sesión ya quedó abierta con el código: se lleva a la portada, que avisa del cambio.
          await navigate(ROUTES.home, { replace: true, state: PASSWORD_UPDATED_NOTICE })
        }}
      />
    </AuthCard>
  )
}

export default ForgotPasswordPage
