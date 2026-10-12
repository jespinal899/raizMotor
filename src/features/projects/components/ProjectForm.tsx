import type { ComponentType, FormEvent } from 'react'
import { ArrowRight, CircleAlert, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import ButtonLink from '@/components/ButtonLink'
import FormSection from '@/components/FormSection'
import StatusAlert from '@/components/StatusAlert'
import StepBackButton from '@/components/StepBackButton'
import StepIndicator from '@/components/StepIndicator'
import StepScreen from '@/components/StepScreen'
import SubmitButton from '@/components/SubmitButton'
import {
  ProjectExtrasScreen,
  ProjectInfoScreen,
  ProjectLocationScreen,
  ProjectModelsScreen,
} from '@/features/projects/components/ProjectFormFields'
import type { ProjectScreenProps } from '@/features/projects/components/ProjectFormFields'
import { useProjectForm } from '@/features/projects/hooks/useProjectForm'
import type { ProjectFormValues, ProjectSubmission } from '@/features/projects/types/projectForm.types'
import { PROJECT_SCREENS } from '@/features/projects/utils/projectFormRules'
import { useInvalidFieldFocus } from '@/hooks/useInvalidFieldFocus'
import { useSteps } from '@/hooks/useSteps'
import { ROUTES } from '@/shared/constants/routes'

/** Contenido de cada pantalla, en el mismo orden que `PROJECT_SCREENS`. */
const SCREENS: ComponentType<ProjectScreenProps>[] = [
  ProjectLocationScreen,
  ProjectInfoScreen,
  ProjectModelsScreen,
  ProjectExtrasScreen,
]

const STEP_TITLES = PROJECT_SCREENS.map(({ title }) => title)

interface ProjectFormProps {
  onSubmit: (project: ProjectSubmission, operationKey: string) => Promise<void>
  /** Los datos de un proyecto ya publicado, cuando se abre para corregirlo. */
  initialValues?: ProjectFormValues
  editing?: boolean
  notify?: (message: string) => void
}

/** El formulario por pasos para publicar un proyecto, o corregir uno publicado. */
const ProjectForm = ({ onSubmit, initialValues, editing = false, notify = toast.success }: ProjectFormProps) => {
  const { values, errors, status, change, validate, submit } = useProjectForm({ onSubmit, initialValues })
  const screens = useSteps(PROJECT_SCREENS.length)
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLFormElement>()

  const screen = PROJECT_SCREENS[screens.current]
  const Screen = SCREENS[screens.current]
  const hasScreenErrors = screen.fields.some((field) => errors[field])
  // La ubicación no se pasa con «Siguiente»: se avanza al confirmarla en el mapa.
  const awaitsLocation = screen.fields.includes('coordinates') && values.coordinates === null

  const goNext = () => {
    if (validate(screen.fields)) screens.next()
    else focusFirstInvalid()
  }

  const save = async () => {
    // Cada pantalla se validó al avanzar, pero se pudo volver atrás y dejar algo sin corregir.
    const firstInvalid = PROJECT_SCREENS.findIndex(({ fields }) => !validate(fields))
    if (firstInvalid !== -1) {
      screens.goTo(firstInvalid)
      focusFirstInvalid()
      return
    }

    await submit()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (screens.isLast) void save()
    else goNext()
  }

  return (
    <form
      ref={containerRef}
      noValidate
      aria-label={editing ? 'Formulario para editar un proyecto' : 'Formulario para publicar un proyecto'}
      onSubmit={handleSubmit}
      className="grid gap-8"
    >
      <StepIndicator label={editing ? 'Pasos para editar' : 'Pasos para publicar'} steps={STEP_TITLES} current={screens.current} />

      <StepScreen
        key={screens.current}
        heading={`Paso ${screens.current + 1} de ${PROJECT_SCREENS.length}: ${screen.title}`}
        direction={screens.direction}
        isEntering={screens.hasMoved}
      >
        <FormSection titleAs="h3" title={screen.title} description={screen.description}>
          <Screen
            values={values}
            errors={errors}
            change={change}
            validate={validate}
            onInvalid={focusFirstInvalid}
            onLocationConfirmed={() => {
              notify('Ubicación guardada con éxito.')
              screens.next()
            }}
          />
        </FormSection>
      </StepScreen>

      <div className="grid gap-4">
        {hasScreenErrors && <p className="text-sm text-destructive">Revisa los campos marcados antes de continuar.</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {screens.isFirst ? <span /> : <StepBackButton onClick={screens.back} />}
          {!awaitsLocation && (
            <SubmitButton
              isSubmitting={status === 'submitting'}
              disabled={screens.isLast && status === 'saved'}
              icon={screens.isLast ? (editing ? Save : Upload) : ArrowRight}
              submittingLabel={editing ? 'Guardando…' : 'Publicando…'}
              className="px-6"
            >
              {screens.isLast ? (editing ? 'Guardar cambios' : 'Publicar proyecto') : 'Siguiente'}
            </SubmitButton>
          )}
        </div>

        {screens.isLast && status === 'limitReached' && (
          <div className="grid gap-3">
            <StatusAlert
              icon={CircleAlert}
              title="Tu plan está completo"
              description="Para publicar otro proyecto, despublica o elimina uno, o cambia a un plan con más proyectos."
              variant="destructive"
            />
            <ButtonLink to={ROUTES.agencyPlans} variant="outline" className="justify-self-start">
              Ver los planes para inmobiliarias
            </ButtonLink>
          </div>
        )}
        {screens.isLast && status === 'failed' && (
          <StatusAlert
            icon={CircleAlert}
            title="No pudimos guardar el proyecto"
            description="Revisa tu conexión e inténtalo de nuevo: lo que escribiste sigue aquí."
            variant="destructive"
          />
        )}
      </div>
    </form>
  )
}

export default ProjectForm
