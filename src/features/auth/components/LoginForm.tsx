import type { FormEvent } from 'react'
import { LogIn } from 'lucide-react'
import CheckboxField from '@/components/CheckboxField'
import EmailField from '@/components/EmailField'
import PasswordField from '@/components/PasswordField'
import CaptchaWidget from '@/components/CaptchaWidget'
import SubmitButton from '@/components/SubmitButton'
import TextLink from '@/components/TextLink'
import { FieldGroup } from '@/components/ui/field'
import AccessSeparator from '@/features/auth/components/AccessSeparator'
import GoogleButton from '@/features/auth/components/GoogleButton'
import LoginAlert from '@/features/auth/components/LoginAlert'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { ROUTES } from '@/shared/constants/routes'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onGoogleSignIn: () => Promise<void>
}

const LoginForm = ({ onSubmit, onGoogleSignIn }: LoginFormProps) => {
  const { values, errors, status, change, submit, signInWithGoogle } = useLoginForm({ onSubmit, onGoogleSignIn })
  const isSubmitting = status === 'submitting'
  const isConnecting = status === 'connecting'
  // Mientras se entra por una vía, la otra queda bloqueada.
  const isBusy = isSubmitting || isConnecting

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Formulario de inicio de sesión" onSubmit={handleSubmit}>
      <FieldGroup>
        <EmailField
          value={values.email}
          error={errors.email}
          onChange={(value) => change('email', value)}
          readOnly={isBusy}
        />

        <PasswordField
          label="Contraseña"
          labelAction={<TextLink to={ROUTES.forgotPassword}>Olvidé mi contraseña</TextLink>}
          error={errors.password}
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(value) => change('password', value)}
          readOnly={isBusy}
        />

        <CheckboxField
          label="Recordarme en este dispositivo"
          name="remember"
          checked={values.remember}
          onChange={(checked) => change('remember', checked)}
          readOnly={isBusy}
        />

        <CaptchaWidget />

        <SubmitButton isSubmitting={isSubmitting} disabled={isConnecting} icon={LogIn} submittingLabel="Ingresando…">
          Iniciar sesión
        </SubmitButton>

        <AccessSeparator />

        <GoogleButton isConnecting={isConnecting} disabled={isSubmitting} onClick={() => void signInWithGoogle()}>
          Iniciar sesión con Google
        </GoogleButton>

        <LoginAlert status={status} />
      </FieldGroup>
    </form>
  )
}

export default LoginForm
