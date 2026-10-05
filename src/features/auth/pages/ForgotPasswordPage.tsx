import { KeyRound } from 'lucide-react'
import AuthPendingPage from '@/features/auth/components/AuthPendingPage'
import { BRAND } from '@/shared/constants/brand'

const ForgotPasswordPage = () => {
  return (
    <AuthPendingPage
      icon={KeyRound}
      title="Recuperar contraseña"
      description={`La recuperación de contraseña aún no está disponible: estamos preparando las cuentas de ${BRAND.name}. Si necesitas ayuda para entrar, contáctanos.`}
    />
  )
}

export default ForgotPasswordPage
