import { KeyRound } from 'lucide-react'
import AuthPendingPage from '@/features/auth/components/AuthPendingPage'

const ForgotPasswordPage = () => {
  return (
    <AuthPendingPage
      icon={KeyRound}
      title="Recuperar contraseña"
      description="La recuperación de contraseña aún no está disponible. Si necesitas ayuda para entrar, contáctanos."
    />
  )
}

export default ForgotPasswordPage
