import { useState } from 'react'
import { PublicationUnavailableError } from '@/features/properties/services/publicationService'
import type {
  PropertyPublication,
  PublicationFormValues,
  PublicationStatus,
} from '@/features/properties/types/publication.types'
import { ADDRESS_FIELDS } from '@/features/properties/utils/publicationSteps'
import { validatePublication } from '@/features/properties/utils/publicationValidation'
import { toPublication } from '@/features/properties/utils/toPublication'
import { useFormFields } from '@/hooks/useFormFields'

interface PublicationFormOptions {
  /** Se resuelve cuando el anuncio queda publicado. */
  onSubmit: (publication: PropertyPublication) => Promise<void>
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
  title: '',
  description: '',
  operation: '',
  price: '',
  images: [],
}

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
  const [status, setStatus] = useState<PublicationStatus>('idle')

  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    // La ciudad elegida pertenecía al departamento anterior.
    if (field === 'department') changeField('city', '')
    // El punto se confirmó para la dirección anterior: hay que volver a buscarla en el mapa.
    if (ADDRESS_FIELDS.includes(field)) changeField('coordinates', null)
    // Editar retira el aviso del intento anterior, pero no reactiva un envío que sigue en curso.
    setStatus((current) => (current === 'submitting' ? current : 'idle'))
  }

  const submit = async () => {
    if (!validateFields()) return

    setStatus('submitting')
    try {
      await onSubmit(toPublication(values))
      setStatus('published')
    } catch (reason) {
      setStatus(reason instanceof PublicationUnavailableError ? 'unavailable' : 'failed')
    }
  }

  return { values, errors, status, change, validate: validateFields, submit }
}
