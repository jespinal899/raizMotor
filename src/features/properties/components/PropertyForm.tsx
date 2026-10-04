import { useState } from 'react'
import type { ComponentType, FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import { toast } from 'sonner'
import FormSection from '@/components/FormSection'
import StepIndicator from '@/components/StepIndicator'
import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/ui/button'
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
import type { StepDirection } from '@/hooks/useSteps'
import { cn } from '@/lib/utils'

interface PropertyFormProps {
  onSubmit: (publication: PropertyPublication) => Promise<void>
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

/** La pantalla nueva entra desde el lado hacia el que se avanza. */
const SLIDE_IN: Record<StepDirection, string> = {
  forward: 'animate-slide-in-right',
  backward: 'animate-slide-in-left',
}

const focusOnMount = (element: HTMLElement | null) => element?.focus()

const PropertyForm = ({ onSubmit, notify = toast.success }: PropertyFormProps) => {
  const { values, errors, status, change, validate, submit } = usePublicationForm({ onSubmit })
  const screens = useSteps(PUBLICATION_SCREENS.length)
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLFormElement>()
  // Al cargar la página no se toca el foco; al cambiar de pantalla va a su título, para anunciarla y subir hasta él.
  const [hasChangedScreen, setHasChangedScreen] = useState(false)

  const screen = PUBLICATION_SCREENS[screens.current]
  const ScreenContent = SCREEN_CONTENT[screens.current]
  const hasScreenErrors = screen.fields.some((field) => errors[field])
  // La ubicación no se pasa con «Siguiente»: se avanza al confirmarla en el mapa.
  const awaitsLocation = screen.fields.includes('coordinates') && values.coordinates === null

  const moveTo = (target: number) => {
    setHasChangedScreen(true)
    screens.goTo(target)
  }

  const goNext = () => {
    if (validate(screen.fields)) moveTo(screens.current + 1)
    else focusFirstInvalid()
  }

  const confirmLocation = () => {
    notify('Ubicación guardada con éxito.')
    moveTo(screens.current + 1)
  }

  const publish = async () => {
    // Cada pantalla se validó al avanzar, pero se pudo volver atrás y dejar algo sin corregir.
    const firstInvalidScreen = PUBLICATION_SCREENS.findIndex(({ fields }) => !validate(fields))

    if (firstInvalidScreen !== -1) {
      moveTo(firstInvalidScreen)
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

      {/*
        Marco de la pantalla: recorta lo que asoma mientras entra deslizándose, para que no ensanche la página
        en móviles. El margen negativo deja sitio al anillo de foco de los campos.
      */}
      <div className="-mx-1 overflow-x-clip px-1">
        {/* La clave reinicia el bloque en cada pantalla: así se repite la animación y el título recibe el foco. */}
        <div key={screens.current} className={cn('grid gap-6', hasChangedScreen && SLIDE_IN[screens.direction])}>
          <h2
            ref={hasChangedScreen ? focusOnMount : undefined}
            tabIndex={-1}
            className="scroll-mt-24 font-heading text-2xl font-semibold tracking-tight outline-none"
          >
            Paso {screen.step + 1} de {PUBLICATION_STEPS.length}: {PUBLICATION_STEPS[screen.step]}
          </h2>

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
        </div>
      </div>

      <div className="grid gap-4">
        {hasScreenErrors && (
          <p className="text-sm text-destructive">Revisa los campos marcados antes de continuar.</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {screens.isFirst ? (
            <span />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => moveTo(screens.current - 1)}
              className="h-11 px-5 text-base"
            >
              <ArrowLeft />
              Atrás
            </Button>
          )}
          {!awaitsLocation && (
            <SubmitButton
              isSubmitting={status === 'submitting'}
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
