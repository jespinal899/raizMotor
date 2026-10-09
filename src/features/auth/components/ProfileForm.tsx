import type { FormEvent } from 'react'
import { CircleAlert, CircleCheck, Save } from 'lucide-react'
import PhoneField from '@/components/PhoneField'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import SubmitButton from '@/components/SubmitButton'
import { FieldGroup } from '@/components/ui/field'
import NameFields from '@/features/auth/components/NameFields'
import { useProfileForm } from '@/features/auth/hooks/useProfileForm'
import type { AccountProfile, ProfileStatus, SessionUser } from '@/features/auth/types/auth.types'

/** Los estados sin entrada (en reposo, guardando) no muestran nada. */
const ALERTS: Partial<Record<ProfileStatus, StatusAlertContent>> = {
  saved: {
    icon: CircleCheck,
    title: 'Tus datos se guardaron',
    description: 'Tus anuncios ya muestran el nombre y el teléfono nuevos.',
    role: 'status',
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos guardar tus datos',
    description: 'Siguen como estaban. Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
}

interface ProfileFormProps {
  user: SessionUser
  onSubmit: (profile: AccountProfile) => Promise<void>
}

/** Con él una cuenta corrige su nombre y el teléfono al que le escriben por sus anuncios. */
const ProfileForm = ({ user, onSubmit }: ProfileFormProps) => {
  const { values, errors, status, change, submit } = useProfileForm({ user, onSubmit })
  const isSubmitting = status === 'submitting'
  const alert = ALERTS[status]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form noValidate aria-label="Formulario de los datos de tu cuenta" onSubmit={handleSubmit}>
      <FieldGroup>
        <NameFields values={values} errors={errors} onChange={change} readOnly={isSubmitting} />

        <PhoneField
          label="Teléfono"
          error={errors.phone}
          name="phone"
          value={values.phone}
          onChange={(value) => change('phone', value)}
          readOnly={isSubmitting}
        />

        {/* El correo es con lo que se entra: cambiarlo exige confirmarlo otra vez, y eso aún no existe. */}
        <div className="grid gap-1 text-sm">
          <span className="font-medium">Correo</span>
          <span className="text-muted-foreground">{user.email}</span>
          <span className="text-xs text-muted-foreground">Con él inicias sesión. Por ahora no se puede cambiar.</span>
        </div>

        <SubmitButton isSubmitting={isSubmitting} icon={Save} submittingLabel="Guardando…">
          Guardar cambios
        </SubmitButton>

        {alert && <StatusAlert {...alert} />}
      </FieldGroup>
    </form>
  )
}

export default ProfileForm
