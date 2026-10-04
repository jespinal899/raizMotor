import { useRef } from 'react'
import { CircleCheck, Search } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import FormGroup from '@/components/FormGroup'
import AddressMapDialog from '@/features/properties/components/AddressMapDialog'
import { useAddressSearch } from '@/features/properties/hooks/useAddressSearch'
import type { GeocodingService } from '@/features/properties/services/geocodingService'
import type { CreateLocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates, PublicationFormValues } from '@/features/properties/types/publication.types'
import { formatAddress } from '@/features/properties/utils/departments'

interface AddressConfirmationProps {
  location: Pick<PublicationFormValues, 'department' | 'city' | 'neighborhood' | 'address'>
  isConfirmed: boolean
  error?: string
  /** Comprueba que la dirección esté completa antes de buscarla; si no lo está, muestra lo que falta. */
  canSearch: () => boolean
  /** Recibe el punto en cuanto la persona lo confirma. */
  onConfirm: (point: Coordinates) => void
  /** Se llama después, cuando la ventana del mapa ya se ha cerrado: es el momento de seguir adelante. */
  onConfirmed?: () => void
  /** A dónde va el foco al volver a editar: a los datos de la ubicación. */
  focusAfterEdit?: () => HTMLElement | null
  locate?: GeocodingService['locate']
  createMap?: CreateLocationMap
}

/** Busca la dirección escrita y abre el mapa para confirmar, o corregir, el punto exacto. */
const AddressConfirmation = ({
  location,
  isConfirmed,
  error,
  canSearch,
  onConfirm,
  onConfirmed,
  focusAfterEdit,
  locate,
  createMap,
}: AddressConfirmationProps) => {
  const { search, start, close } = useAddressSearch(locate)
  // La ventana se cierra igual al confirmar que al editar; esto recuerda por cuál de las dos fue.
  const closedByConfirming = useRef(false)

  const handleSearch = () => {
    if (canSearch()) void start(location)
  }

  const handleConfirm = (point: Coordinates) => {
    closedByConfirming.current = true
    onConfirm(point)
    close()
  }

  const handleEdit = () => {
    closedByConfirming.current = false
    close()
  }

  const handleClosed = () => {
    if (!closedByConfirming.current) return

    closedByConfirming.current = false
    onConfirmed?.()
  }

  // Al editar, el foco vuelve a los datos de la ubicación; al confirmar no se mueve, porque se pasa a otra pantalla.
  const chooseFocusOnClose = () => (closedByConfirming.current ? false : (focusAfterEdit?.() ?? null))

  return (
    <FormGroup label="Ubicación en el mapa" error={error}>
      {(group) => (
        <div role="group" {...group} className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <BusyButton
            variant="outline"
            size="lg"
            isBusy={search.status === 'searching'}
            icon={Search}
            busyLabel="Buscando…"
            onClick={handleSearch}
            className="h-11 px-4 text-base"
          >
            Buscar dirección
          </BusyButton>

          {isConfirmed && (
            <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <CircleCheck className="size-4" aria-hidden="true" />
              Ubicación confirmada en el mapa.
            </p>
          )}

          <AddressMapDialog
            open={search.status === 'reviewing'}
            address={formatAddress(location)}
            review={search.review}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onClosed={handleClosed}
            finalFocus={chooseFocusOnClose}
            createMap={createMap}
          />
        </div>
      )}
    </FormGroup>
  )
}

export default AddressConfirmation
