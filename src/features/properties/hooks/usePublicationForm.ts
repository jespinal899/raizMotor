import { useState } from 'react'
import { PublicationUnavailableError } from '@/features/properties/services/publicationService'
import type {
  PropertyPublication,
  PublicationFormValues,
  PublicationStatus,
} from '@/features/properties/types/publication.types'
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

/** Lo que necesita cada bloque de campos del formulario. */
export type PublicationFieldsProps = Pick<ReturnType<typeof usePublicationForm>, 'values' | 'errors' | 'change'>

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
    // El punto marcado pertenecía al departamento anterior: hay que volver a colocarlo.
    if (field === 'department') changeField('coordinates', null)
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

  return { values, errors, status, change, submit }
}
