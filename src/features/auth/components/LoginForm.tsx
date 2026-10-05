import type { FormEvent } from 'react'
import { LogIn } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import FormField from '@/components/FormField'
import PasswordInput from '@/components/PasswordInput'
import SubmitButton from '@/components/SubmitButton'
import TextLink from '@/components/TextLink'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GoogleIcon from '@/features/auth/components/GoogleIcon'
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
      <FormField label="Correo" error={errors.email}>
        {(control) => (
          <Input
            {...control}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nombre@gmail.com"
            value={values.email}
            onChange={(event) => change('email', event.target.value)}
            readOnly={isBusy}
            className="h-11"
          />
        )}
      </FormField>

      <FormField label="Contraseña" error={errors.password}>
        {(control) => (
          <PasswordInput
            {...control}
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => change('password', event.target.value)}
            readOnly={isBusy}
            className="h-11"
          />
        )}
      </FormField>

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

      <p className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        o
      </p>

      <BusyButton
        variant="outline"
        size="lg"
        isBusy={isConnecting}
        disabled={isSubmitting}
        icon={GoogleIcon}
        busyLabel="Conectando con Google…"
        onClick={() => void signInWithGoogle()}
        className="h-11 text-base"
      >
        Iniciar sesión con Google
      </BusyButton>

      <LoginAlert status={status} />
    </form>
  )
}

export default LoginForm
