import { Construction, MailCheck } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import AuthCard from '@/features/auth/components/AuthCard'
import RegisterForm from '@/features/auth/components/RegisterForm'
import { useRegistration } from '@/features/auth/hooks/useRegistration'
import { ACCOUNTS_AVAILABLE } from '@/features/auth/services/authService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const LOGIN_ALTERNATIVE = { question: '¿Ya tienes cuenta?', action: 'Inicia sesión', to: ROUTES.login }

const RegisterPage = () => {
  const { confirmationEmail, register, registerWithGoogle } = useRegistration()

  usePageTitle('Crear una cuenta')

  return (
    <AuthCard
      title="Crear una cuenta"
      description="Regístrate para publicar y gestionar tus propiedades."
      alternative={LOGIN_ALTERNATIVE}
    >
      {confirmationEmail ? (
        // La cuenta existe, pero no se activa hasta abrir el enlace: el formulario ya no hace falta.
        <StatusAlert
          role="status"
          icon={MailCheck}
          title="Revisa tu correo"
          description={`Te enviamos un enlace a ${confirmationEmail} para confirmar tu cuenta. Ábrelo para activarla; si no lo ves en unos minutos, revisa el correo no deseado.`}
        />
      ) : (
        <>
          {/* Sin el servicio de cuentas, se avisa antes de que nadie escriba sus datos, no solo al enviarlos. */}
          {!ACCOUNTS_AVAILABLE && (
            <StatusAlert
              role="note"
              icon={Construction}
              title="El registro está en construcción"
              description="Este formulario todavía no enviará ni guardará tus datos."
            />
          )}
          <RegisterForm onSubmit={register} onGoogleSignUp={registerWithGoogle} />
        </>
      )}
    </AuthCard>
  )
}

export default RegisterPage
