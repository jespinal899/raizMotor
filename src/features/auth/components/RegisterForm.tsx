import type { FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import EmailField from '@/components/EmailField'
import PasswordField from '@/components/PasswordField'
import PhoneField from '@/components/PhoneField'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import AccessSeparator from '@/features/auth/components/AccessSeparator'
import GoogleButton from '@/features/auth/components/GoogleButton'
import NameFields from '@/features/auth/components/NameFields'
import RegisterAlert from '@/features/auth/components/RegisterAlert'
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm'
import type { RegistrationCredentials } from '@/features/auth/types/auth.types'
import { MIN_PASSWORD_LENGTH } from '@/features/auth/utils/credentialRules'

interface RegisterFormProps {
  onSubmit: (credentials: RegistrationCredentials, operationKey: string) => Promise<void>
  onGoogleSignUp: () => Promise<void>
}

const RegisterForm = ({ onSubmit, onGoogleSignUp }: RegisterFormProps) => {
  const { values, errors, status, change, submit, signUpWithGoogle } = useRegisterForm({ onSubmit, onGoogleSignUp })
  const isSubmitting = status === 'submitting'
  const isConnecting = status === 'connecting'
  // Mientras se crea la cuenta por una vía, la otra queda bloqueada.
  const isBusy = isSubmitting || isConnecting

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Formulario de registro" onSubmit={handleSubmit}>
      <FieldGroup>
        <NameFields values={values} errors={errors} onChange={change} readOnly={isBusy} />

        <EmailField
          value={values.email}
          error={errors.email}
          onChange={(value) => change('email', value)}
          readOnly={isBusy}
        />

        <PhoneField
          label="Teléfono"
          error={errors.phone}
          name="phone"
          value={values.phone}
          onChange={(value) => change('phone', value)}
          readOnly={isBusy}
        />

        <PasswordField
          label="Contraseña"
          hint={`mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          error={errors.password}
          name="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={values.password}
          onChange={(value) => change('password', value)}
          readOnly={isBusy}
        />

        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={isConnecting}
          icon={UserPlus}
          submittingLabel="Creando cuenta…"
        >
          Crear cuenta
        </SubmitButton>

        <AccessSeparator />

        <GoogleButton isConnecting={isConnecting} disabled={isSubmitting} onClick={() => void signUpWithGoogle()}>
          Registrarse con Google
        </GoogleButton>

        <RegisterAlert status={status} />
      </FieldGroup>
    </form>
  )
}

export default RegisterForm
