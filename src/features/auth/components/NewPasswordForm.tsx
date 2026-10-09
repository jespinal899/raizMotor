import type { FormEvent } from 'react'
import { CircleAlert, CircleCheck, KeyRound } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PasswordField from '@/components/PasswordField'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import { useNewPasswordForm } from '@/features/auth/hooks/useNewPasswordForm'
import type { PasswordChangeFailure } from '@/features/auth/types/auth.types'
import { MIN_PASSWORD_LENGTH } from '@/features/auth/utils/credentialRules'
import { ROUTES } from '@/shared/constants/routes'

/** Por qué no se guardó la contraseña. */
const FAILURES: Record<PasswordChangeFailure, StatusAlertContent> = {
  unchanged: {
    icon: CircleAlert,
    title: 'Esa ya era tu contraseña',
    description: 'Elige una distinta de la anterior.',
    variant: 'destructive',
  },
  expired: {
    icon: CircleAlert,
    title: 'El enlace ya no es válido',
    description: 'Pide otro desde «Olvidé mi contraseña» y vuelve a intentarlo.',
    variant: 'destructive',
  },
  failed: {
    icon: CircleAlert,
    title: 'Algo salió mal',
    description: 'No pudimos guardar tu contraseña. Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
}

interface NewPasswordFormProps {
  onSubmit: (password: string, operationKey: string) => Promise<void>
}

/** Con él elige otra contraseña quien llegó desde el enlace de su correo. */
const NewPasswordForm = ({ onSubmit }: NewPasswordFormProps) => {
  const { values, errors, status, change, submit } = useNewPasswordForm({ onSubmit })
  const isSubmitting = status === 'submitting'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  if (status === 'changed') {
    return (
      <>
        <StatusAlert
          role="status"
          icon={CircleCheck}
          title="Contraseña actualizada"
          description="Desde ahora entras con ella. Tu sesión ya está iniciada."
        />
        <ButtonLink to={ROUTES.home} size="lg" className="h-11 text-base">
          Ir al inicio
        </ButtonLink>
      </>
    )
  }

  return (
    <form noValidate aria-label="Formulario para elegir otra contraseña" onSubmit={handleSubmit}>
      <FieldGroup>
        <PasswordField
          label="Nueva contraseña"
          hint={`mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          error={errors.password}
          name="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={values.password}
          onChange={(value) => change('password', value)}
          readOnly={isSubmitting}
        />

        <SubmitButton isSubmitting={isSubmitting} icon={KeyRound} submittingLabel="Guardando…">
          Guardar contraseña
        </SubmitButton>

        {Object.hasOwn(FAILURES, status) && <StatusAlert {...FAILURES[status as PasswordChangeFailure]} />}
      </FieldGroup>
    </form>
  )
}

export default NewPasswordForm
