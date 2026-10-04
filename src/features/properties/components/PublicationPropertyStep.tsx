import { useRef } from 'react'
import FormSection from '@/components/FormSection'
import AddressConfirmation from '@/features/properties/components/AddressConfirmation'
import PublicationDetailFields from '@/features/properties/components/PublicationDetailFields'
import PublicationLocationFields from '@/features/properties/components/PublicationLocationFields'
import type { PublicationStepProps } from '@/features/properties/hooks/usePublicationForm'
import type { Coordinates } from '@/features/properties/types/publication.types'
import { ADDRESS_FIELDS } from '@/features/properties/utils/publicationSteps'

/** Paso 1: dónde está la propiedad, confirmado en el mapa, y de qué tipo es. */
const PublicationPropertyStep = ({ values, errors, change, validate, onInvalid }: PublicationStepProps) => {
  const addressRef = useRef<HTMLInputElement>(null)
  const typeSectionRef = useRef<HTMLElement>(null)
  const fields = { values, errors, change }

  const canSearchAddress = () => {
    const isComplete = validate(ADDRESS_FIELDS)
    if (!isComplete) onInvalid()

    return isComplete
  }

  const confirmAddress = (point: Coordinates) => {
    change('coordinates', point)
    // Con la dirección confirmada, la pantalla sigue con el tipo de propiedad.
    typeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <FormSection titleAs="h3" title="Ubicación" description="Escribe la dirección y confírmala en el mapa.">
        <PublicationLocationFields {...fields} addressRef={addressRef} />
        <AddressConfirmation
          location={values}
          isConfirmed={values.coordinates !== null}
          error={errors.coordinates}
          canSearch={canSearchAddress}
          onConfirm={confirmAddress}
          focusAfterConfirm={() => typeSectionRef.current?.querySelector<HTMLElement>('[role="radio"]') ?? null}
          focusAfterEdit={() => addressRef.current}
        />
      </FormSection>

      <FormSection
        ref={typeSectionRef}
        titleAs="h3"
        title="Tipo de propiedad"
        description="Los datos que se piden cambian según el tipo."
      >
        <PublicationDetailFields {...fields} />
      </FormSection>
    </>
  )
}

export default PublicationPropertyStep
