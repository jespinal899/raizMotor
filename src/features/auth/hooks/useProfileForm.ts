import type { AccountProfile, SessionUser } from '@/features/auth/types/auth.types'
import { validateProfile } from '@/features/auth/utils/registerValidation'
import { useAttemptForm } from '@/hooks/useAttemptForm'
import { formatLocalPhone, toInternationalPhone } from '@/shared/utils/honduranPhone'

interface ProfileFormOptions {
  /** La cuenta cuyos datos se corrigen: con ellos empieza el formulario. */
  user: SessionUser
  /** Se resuelve cuando los datos quedaron guardados; se rechaza si no se pudo. */
  onSubmit: (profile: AccountProfile) => Promise<void>
}

/** Formulario con el que una cuenta corrige su nombre y el teléfono al que le escriben. */
export const useProfileForm = ({ user, onSubmit }: ProfileFormOptions) => {
  const { values, errors, status, change, validateFields, attempt } = useAttemptForm<
    AccountProfile,
    'submitting',
    'failed',
    'saved'
  >({
    // El teléfono se guarda completo, pero se escribe como en el registro: solo el número local.
    initialValues: { firstName: user.firstName, lastName: user.lastName, phone: formatLocalPhone(user.phone) },
    validate: validateProfile,
    toFailure: () => 'failed',
    succeeded: 'saved',
  })

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', () =>
      onSubmit({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: toInternationalPhone(values.phone),
      }),
    )
  }

  return { values, errors, status, change, submit }
}
