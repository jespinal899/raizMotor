import type { FormEvent } from 'react'
import { LogIn } from 'lucide-react'
import PasswordField from '@/components/PasswordField'
import SubmitButton from '@/components/SubmitButton'
import TextDivider from '@/components/TextDivider'
import TextLink from '@/components/TextLink'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import EmailField from '@/features/auth/components/EmailField'
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
    <form noValidate aria-label="Formulario de inicio de sesión" onSubmit={handleSubmit} className="grid gap-5">
      <EmailField
        value={values.email}
        error={errors.email}
        onChange={(value) => change('email', value)}
        readOnly={isBusy}
      />

      <PasswordField
        label="Contraseña"
        error={errors.password}
        name="password"
        autoComplete="current-password"
        value={values.password}
        onChange={(value) => change('password', value)}
        readOnly={isBusy}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Label className="font-normal">
          <Checkbox
            name="remember"
            checked={values.remember}
            onCheckedChange={(checked) => change('remember', checked)}
            readOnly={isBusy}
          />
          Recordarme en este dispositivo
        </Label>
        <TextLink to={ROUTES.forgotPassword}>Olvidé mi contraseña</TextLink>
      </div>

      <SubmitButton isSubmitting={isSubmitting} disabled={isConnecting} icon={LogIn} submittingLabel="Ingresando…">
        Iniciar sesión
      </SubmitButton>

      <TextDivider>o</TextDivider>

      <GoogleButton isConnecting={isConnecting} disabled={isSubmitting} onClick={() => void signInWithGoogle()}>
        Iniciar sesión con Google
      </GoogleButton>

      <LoginAlert status={status} />
    </form>
  )
}

export default LoginForm
