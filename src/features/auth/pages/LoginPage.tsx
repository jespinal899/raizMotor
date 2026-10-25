import { useSearchParams } from 'react-router-dom'
import AuthCard from '@/features/auth/components/AuthCard'
import LoginForm from '@/features/auth/components/LoginForm'
import { useEnter } from '@/features/auth/hooks/useEnter'
import { authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { BRAND } from '@/shared/constants/brand'
import { RETURN_PARAM, ROUTES, registerPath } from '@/shared/constants/routes'

const LoginPage = () => {
  const enter = useEnter()
  const [params] = useSearchParams()
  const returnTo = params.get(RETURN_PARAM)
  // Quien pasa a crear la cuenta no pierde a dónde iba, p. ej. el plan que eligió.
  const registerAlternative = {
    question: '¿No tienes cuenta?',
    action: 'Regístrate',
    to: returnTo ? registerPath(returnTo) : ROUTES.register,
  }

  usePageTitle('Iniciar sesión')

  return (
    <AuthCard
      title={`¡Bienvenido a ${BRAND.name}!`}
      description="Inicia sesión para publicar y gestionar tus propiedades."
      alternative={registerAlternative}
    >
      <LoginForm
        onSubmit={(credentials) => enter(() => authService.login(credentials))}
        onGoogleSignIn={() => enter(() => authService.loginWithGoogle())}
        onConfirmEmail={(email, code) => enter(() => authService.confirmEmail(email, code))}
        onResendConfirmation={(email) => authService.resendConfirmation(email)}
      />
    </AuthCard>
  )
}

export default LoginPage
