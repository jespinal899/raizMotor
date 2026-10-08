import type { ComponentType, FormEvent } from 'react'
import { ArrowRight, Upload } from 'lucide-react'
import { toast } from 'sonner'
import FormSection from '@/components/FormSection'
import StepBackButton from '@/components/StepBackButton'
import StepIndicator from '@/components/StepIndicator'
import StepScreen from '@/components/StepScreen'
import SubmitButton from '@/components/SubmitButton'
import PublicationAlert from '@/features/properties/components/PublicationAlert'
import PublicationDetailFields from '@/features/properties/components/PublicationDetailFields'
import PublicationListingFields from '@/features/properties/components/PublicationListingFields'
import PublicationLocationScreen from '@/features/properties/components/PublicationLocationScreen'
import PublicationPhotoFields from '@/features/properties/components/PublicationPhotoFields'
import PublicationPricingFields from '@/features/properties/components/PublicationPricingFields'
import { usePublicationForm } from '@/features/properties/hooks/usePublicationForm'
import type { PublicationScreenProps } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { PUBLICATION_SCREENS, PUBLICATION_STEPS } from '@/features/properties/utils/publicationSteps'
import { useInvalidFieldFocus } from '@/hooks/useInvalidFieldFocus'
import { useSteps } from '@/hooks/useSteps'

interface PropertyFormProps {
  onSubmit: (publication: PropertyPublication, operationKey: string) => Promise<void>
  /** Muestra un aviso breve a la persona; por defecto, uno flotante. */
  notify?: (message: string) => void
}

/** Contenido de cada pantalla, en el mismo orden que `PUBLICATION_SCREENS`. */
const SCREEN_CONTENT: ComponentType<PublicationScreenProps>[] = [
  PublicationLocationScreen,
  PublicationDetailFields,
  PublicationListingFields,
  PublicationPricingFields,
  PublicationPhotoFields,
]

const PropertyForm = ({ onSubmit, notify = toast.success }: PropertyFormProps) => {
  const { values, errors, status, change, validate, submit } = usePublicationForm({ onSubmit })
  const screens = useSteps(PUBLICATION_SCREENS.length)
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLFormElement>()

  const screen = PUBLICATION_SCREENS[screens.current]
  const ScreenContent = SCREEN_CONTENT[screens.current]
  const hasScreenErrors = screen.fields.some((field) => errors[field])
  // La ubicación no se pasa con «Siguiente»: se avanza al confirmarla en el mapa.
  const awaitsLocation = screen.fields.includes('coordinates') && values.coordinates === null

  const goNext = () => {
    if (validate(screen.fields)) screens.next()
    else focusFirstInvalid()
  }

  const confirmLocation = () => {
    notify('Ubicación guardada con éxito.')
    screens.next()
  }

  const publish = async () => {
    // Cada pantalla se validó al avanzar, pero se pudo volver atrás y dejar algo sin corregir.
    const firstInvalidScreen = PUBLICATION_SCREENS.findIndex(({ fields }) => !validate(fields))

    if (firstInvalidScreen !== -1) {
      screens.goTo(firstInvalidScreen)
      focusFirstInvalid()
      return
    }

    await submit()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (screens.isLast) void publish()
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
      <StepIndicator label="Pasos para publicar" steps={PUBLICATION_STEPS} current={screen.step} />

      <StepScreen
        key={screens.current}
        heading={`Paso ${screen.step + 1} de ${PUBLICATION_STEPS.length}: ${PUBLICATION_STEPS[screen.step]}`}
        direction={screens.direction}
        isEntering={screens.hasMoved}
      >
        <FormSection titleAs="h3" title={screen.title} description={screen.description}>
          <ScreenContent
            values={values}
            errors={errors}
            change={change}
            validate={validate}
            onInvalid={focusFirstInvalid}
            onLocationConfirmed={confirmLocation}
          />
        </FormSection>
      </StepScreen>

      <div className="grid gap-4">
        {hasScreenErrors && (
          <p className="text-sm text-destructive">Revisa los campos marcados antes de continuar.</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {screens.isFirst ? <span /> : <StepBackButton onClick={screens.back} />}
          {!awaitsLocation && (
            <SubmitButton
              isSubmitting={status === 'submitting'}
              // Ya publicada, repetirlo no crearía nada: el botón vuelve a activarse al cambiar algún dato.
              disabled={screens.isLast && status === 'published'}
              icon={screens.isLast ? Upload : ArrowRight}
              submittingLabel="Publicando…"
              className="px-6"
            >
              {screens.isLast ? 'Publicar propiedad' : 'Siguiente'}
            </SubmitButton>
          )}
        </div>

        {screens.isLast && <PublicationAlert status={status} />}
      </div>
    </form>
  )
}

export default PropertyForm
