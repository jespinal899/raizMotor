import { Construction, UserPlus } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import AuthCard from '@/features/auth/components/AuthCard'
import RegisterForm from '@/features/auth/components/RegisterForm'
import { useEnter } from '@/features/auth/hooks/useEnter'
import { authService } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const LOGIN_ALTERNATIVE = { question: '¿Ya tienes cuenta?', action: 'Inicia sesión', to: ROUTES.login }

const RegisterPage = () => {
  const enter = useEnter()

  usePageTitle('Crear una cuenta')

  return (
    <AuthCard
      icon={UserPlus}
      title="Crear una cuenta"
      description="Regístrate para publicar y gestionar tus propiedades."
      alternative={LOGIN_ALTERNATIVE}
    >
      <div className="grid gap-6">
        {/* Se avisa antes de que nadie escriba sus datos, no solo cuando el envío se rechaza. */}
        <StatusAlert
          role="note"
          icon={Construction}
          title="El registro está en construcción"
          description="Este formulario todavía no enviará ni guardará tus datos."
        />
        <RegisterForm
          onSubmit={(credentials) => enter(() => authService.register(credentials))}
          // Con Google, registrarse e iniciar sesión son la misma operación: la cuenta se crea al entrar por primera vez.
          onGoogleSignUp={() => enter(() => authService.loginWithGoogle())}
        />
      </div>
    </AuthCard>
  )
}

export default RegisterPage
