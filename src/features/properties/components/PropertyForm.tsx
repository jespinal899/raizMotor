import { useState } from 'react'
import type { ComponentType, FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import StepIndicator from '@/components/StepIndicator'
import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/ui/button'
import PublicationAlert from '@/features/properties/components/PublicationAlert'
import PublicationDetailsStep from '@/features/properties/components/PublicationDetailsStep'
import PublicationListingStep from '@/features/properties/components/PublicationListingStep'
import PublicationPropertyStep from '@/features/properties/components/PublicationPropertyStep'
import { usePublicationForm } from '@/features/properties/hooks/usePublicationForm'
import type { PublicationStepProps } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { PUBLICATION_STEPS } from '@/features/properties/utils/publicationSteps'
import { useInvalidFieldFocus } from '@/hooks/useInvalidFieldFocus'
import { useSteps } from '@/hooks/useSteps'
import type { StepDirection } from '@/hooks/useSteps'
import { cn } from '@/lib/utils'

interface PropertyFormProps {
  onSubmit: (publication: PropertyPublication) => Promise<void>
}

/** Contenido de cada paso, en el mismo orden que `PUBLICATION_STEPS`. */
const STEP_CONTENT: ComponentType<PublicationStepProps>[] = [
  PublicationPropertyStep,
  PublicationListingStep,
  PublicationDetailsStep,
]

const STEP_TITLES = PUBLICATION_STEPS.map(({ title }) => title)

/** El paso nuevo entra desde el lado hacia el que se avanza. */
const SLIDE_IN: Record<StepDirection, string> = {
  forward: 'animate-slide-in-right',
  backward: 'animate-slide-in-left',
}

const focusOnMount = (element: HTMLElement | null) => element?.focus()

const PropertyForm = ({ onSubmit }: PropertyFormProps) => {
  const { values, errors, status, change, validate, submit } = usePublicationForm({ onSubmit })
  const steps = useSteps(PUBLICATION_STEPS.length)
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLFormElement>()
  // Al cargar la página no se toca el foco; al cambiar de paso va a su título, para anunciarlo y subir hasta él.
  const [hasChangedStep, setHasChangedStep] = useState(false)

  const { title, fields } = PUBLICATION_STEPS[steps.current]
  const StepContent = STEP_CONTENT[steps.current]
  const hasStepErrors = fields.some((field) => errors[field])

  const moveTo = (step: number) => {
    setHasChangedStep(true)
    steps.goTo(step)
  }

  const goNext = () => {
    if (validate(fields)) moveTo(steps.current + 1)
    else focusFirstInvalid()
  }

  const publish = async () => {
    // Cada paso se validó al avanzar, pero se pudo volver atrás y dejar algo sin corregir.
    const firstInvalidStep = PUBLICATION_STEPS.findIndex((step) => !validate(step.fields))

    if (firstInvalidStep !== -1) {
      moveTo(firstInvalidStep)
      focusFirstInvalid()
      return
    }

    await submit()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (steps.isLast) void publish()
    else goNext()
  }

  return (
    <form
      ref={containerRef}
      noValidate
      aria-label="Formulario para publicar una propiedad"
      onSubmit={handleSubmit}
      className="grid gap-8"
    >
      <StepIndicator label="Pasos para publicar" steps={STEP_TITLES} current={steps.current} />

      {/* La clave reinicia el bloque en cada paso: así se repite la animación de entrada y el título recibe el foco. */}
      <div key={steps.current} className={cn('grid gap-6', hasChangedStep && SLIDE_IN[steps.direction])}>
        <h2
          ref={hasChangedStep ? focusOnMount : undefined}
          tabIndex={-1}
          className="scroll-mt-24 font-heading text-2xl font-semibold tracking-tight outline-none"
        >
          Paso {steps.current + 1} de {PUBLICATION_STEPS.length}: {title}
        </h2>

        <StepContent
          values={values}
          errors={errors}
          change={change}
          validate={validate}
          onInvalid={focusFirstInvalid}
        />
      </div>

      <div className="grid gap-4">
        {hasStepErrors && (
          <p className="text-sm text-destructive">Revisa los campos marcados antes de continuar.</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {steps.isFirst ? (
            <span />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => moveTo(steps.current - 1)}
              className="h-11 px-5 text-base"
            >
              <ArrowLeft />
              Atrás
            </Button>
          )}
          <SubmitButton
            isSubmitting={status === 'submitting'}
            icon={steps.isLast ? Upload : ArrowRight}
            submittingLabel="Publicando…"
            className="px-6"
          >
            {steps.isLast ? 'Publicar propiedad' : 'Siguiente'}
          </SubmitButton>
        </div>

        {steps.isLast && <PublicationAlert status={status} />}
      </div>
    </form>
  )
}

export default PropertyForm
