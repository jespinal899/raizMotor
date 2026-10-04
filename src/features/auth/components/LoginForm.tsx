import type { FormEvent } from 'react'
import { LoaderCircle, LogIn } from 'lucide-react'
import FormField from '@/components/FormField'
import PasswordInput from '@/components/PasswordInput'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoginAlert from '@/features/auth/components/LoginAlert'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'
import type { LoginCredentials } from '@/features/auth/types/auth.types'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { values, errors, status, change, submit } = useLoginForm({ onSubmit })
  const isSubmitting = status === 'submitting'

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
            readOnly={isSubmitting}
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
            readOnly={isSubmitting}
            className="h-11"
          />
        )}
      </FormField>

      <Label className="justify-self-start font-normal">
        <Checkbox
          name="remember"
          checked={values.remember}
          onCheckedChange={(checked) => change('remember', checked)}
          readOnly={isSubmitting}
        />
        Recordarme en este dispositivo
      </Label>

      <Button type="submit" size="lg" disabled={isSubmitting} className="h-11 text-base">
        {isSubmitting ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>

      <LoginAlert status={status} />
    </form>
  )
}

export default LoginForm
