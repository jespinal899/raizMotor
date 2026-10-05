import { LogIn } from 'lucide-react'
import AuthCard from '@/features/auth/components/AuthCard'
import LoginForm from '@/features/auth/components/LoginForm'
import { useEnter } from '@/features/auth/hooks/useEnter'
import { authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES } from '@/shared/constants/routes'

const REGISTER_ALTERNATIVE = { question: '¿No tienes cuenta?', action: 'Regístrate', to: ROUTES.register }

const LoginPage = () => {
  const enter = useEnter()

  usePageTitle('Iniciar sesión')

  return (
    <AuthCard
      icon={LogIn}
      title={`¡Bienvenido a ${BRAND.name}!`}
      description="Inicia sesión para publicar y gestionar tus propiedades."
      alternative={REGISTER_ALTERNATIVE}
    >
      <LoginForm
        onSubmit={(credentials) => enter(() => authService.login(credentials))}
        onGoogleSignIn={() => enter(() => authService.loginWithGoogle())}
      />
    </AuthCard>
  )
}

export default LoginPage
