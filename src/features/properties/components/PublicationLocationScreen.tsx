import { useRef } from 'react'
import AddressConfirmation from '@/features/properties/components/AddressConfirmation'
import PublicationLocationFields from '@/features/properties/components/PublicationLocationFields'
import type { PublicationScreenProps } from '@/features/properties/hooks/usePublicationForm'
import { ADDRESS_FIELDS } from '@/features/properties/utils/publicationSteps'

/** Pantalla de la ubicación: los datos de la dirección y su confirmación en el mapa. */
const PublicationLocationScreen = ({
  values,
  errors,
  change,
  validate,
  onInvalid,
  onLocationConfirmed,
}: PublicationScreenProps) => {
  const fieldsRef = useRef<HTMLDivElement>(null)

  const canSearchAddress = () => {
    const isComplete = validate(ADDRESS_FIELDS)
    if (!isComplete) onInvalid()

    return isComplete
  }

  return (
    <>
      <PublicationLocationFields ref={fieldsRef} values={values} errors={errors} change={change} />
      <AddressConfirmation
        location={values}
        isConfirmed={values.coordinates !== null}
        error={errors.coordinates}
        canSearch={canSearchAddress}
        onConfirm={(point) => change('coordinates', point)}
        onConfirmed={onLocationConfirmed}
        focusAfterEdit={() => fieldsRef.current?.querySelector<HTMLElement>('[role="combobox"]') ?? null}
      />
    </>
  )
}

export default PublicationLocationScreen
