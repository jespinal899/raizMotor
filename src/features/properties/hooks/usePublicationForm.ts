import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import type { PropertyPublication, PublicationFormValues } from '@/features/properties/types/publication.types'
import { ADDRESS_FIELDS } from '@/features/properties/utils/publicationSteps'
import { validatePublication } from '@/features/properties/utils/publicationValidation'
import { toPublication } from '@/features/properties/utils/toPublication'
import { useAttempt } from '@/hooks/useAttempt'
import { useFormFields } from '@/hooks/useFormFields'

interface PublicationFormOptions {
  /** Se resuelve cuando el anuncio queda publicado. La clave identifica la publicación, para no crearla dos veces. */
  onSubmit: (publication: PropertyPublication, operationKey: string) => Promise<void>
}

const EMPTY_PUBLICATION: PublicationFormValues = {
  department: '',
  city: '',
  neighborhood: '',
  address: '',
  coordinates: null,
  type: '',
  builtArea: '',
  landArea: '',
  bedrooms: '',
  bathrooms: '',
  parking: '',
  features: [],
  title: '',
  description: '',
  operation: '',
  price: '',
  images: [],
}

/** Haber usado ya la publicación gratuita no es un fallo del navegador: reintentar no lo arregla. */
const toFailureStatus = (reason: unknown) => (reason instanceof PublicationLimitError ? 'limitReached' : 'failed')

type PublicationForm = ReturnType<typeof usePublicationForm>

/** Lo que necesita cada bloque de campos del formulario. */
export type PublicationFieldsProps = Pick<PublicationForm, 'values' | 'errors' | 'change'>

/** Lo que recibe cada pantalla del formulario. */
export interface PublicationScreenProps extends PublicationFieldsProps {
  /** Comprueba unos campos, muestra sus errores y dice si son válidos. */
  validate: PublicationForm['validate']
  /** Lleva el foco al primer campo con error. */
  onInvalid: () => void
  /** La ubicación quedó confirmada en el mapa: se puede pasar a la pantalla siguiente. */
  onLocationConfirmed: () => void
}

export const usePublicationForm = ({ onSubmit }: PublicationFormOptions) => {
  const {
    values,
    errors,
    change: changeField,
    validateFields,
  } = useFormFields({ initialValues: EMPTY_PUBLICATION, validate: validatePublication })
  const { status, attempt, reset } = useAttempt<'submitting', 'failed' | 'limitReached', 'published'>({
    toFailure: toFailureStatus,
    succeeded: 'published',
  })

  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    // La ciudad elegida pertenecía al departamento anterior.
    if (field === 'department') changeField('city', '')
    // El punto se confirmó para la dirección anterior: hay que volver a buscarla en el mapa.
    if (ADDRESS_FIELDS.includes(field)) changeField('coordinates', null)
    // Editar retira el aviso del intento anterior, pero no reactiva un envío que sigue en curso.
    reset()
  }

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', (operationKey) => onSubmit(toPublication(values), operationKey))
  }

  return { values, errors, status, change, validate: validateFields, submit }
}
