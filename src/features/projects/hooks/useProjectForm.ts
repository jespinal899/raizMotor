import type { ProjectFormValues, ProjectSubmission } from '@/features/projects/types/projectForm.types'
import { ADDRESS_FIELDS, EMPTY_PROJECT, toProjectSubmission, validateProject } from '@/features/projects/utils/projectFormRules'
import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import { useAttempt } from '@/hooks/useAttempt'
import { useFormFields } from '@/hooks/useFormFields'

interface ProjectFormOptions {
  /** Se resuelve cuando el proyecto quedó guardado. La clave identifica el envío, para no guardarlo dos veces. */
  onSubmit: (project: ProjectSubmission, operationKey: string) => Promise<void>
  /** En blanco al publicar, o con los datos del proyecto que se corrige. */
  initialValues?: ProjectFormValues
}

/** El formulario de un proyecto: sus valores, sus errores y el estado del envío. */
export const useProjectForm = ({ onSubmit, initialValues = EMPTY_PROJECT }: ProjectFormOptions) => {
  const { values, errors, change: changeField, validateFields } = useFormFields({ initialValues, validate: validateProject })
  const { status, attempt, reset } = useAttempt<'submitting', 'failed' | 'limitReached', 'saved'>({
    toFailure: (reason) => (reason instanceof PublicationLimitError ? 'limitReached' : 'failed'),
    succeeded: 'saved',
  })

  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    // La ciudad elegida pertenecía al departamento anterior.
    if (field === 'department') changeField('city', '')
    // El punto se confirmó para la dirección anterior: hay que volver a buscarla en el mapa.
    if (ADDRESS_FIELDS.includes(field)) changeField('coordinates', null)
    reset()
  }

  const submit = async () => {
    if (!validateFields()) return

    await attempt('submitting', (operationKey) => onSubmit(toProjectSubmission(values), operationKey))
  }

  return { values, errors, status, change, validate: validateFields, submit }
}

export type ProjectForm = ReturnType<typeof useProjectForm>
