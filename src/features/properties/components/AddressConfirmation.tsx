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

type FocusTarget = () => HTMLElement | null

interface AddressConfirmationProps {
  location: Pick<PublicationFormValues, 'department' | 'city' | 'neighborhood' | 'address'>
  isConfirmed: boolean
  error?: string
  /** Comprueba que la dirección esté completa antes de buscarla; si no lo está, muestra lo que falta. */
  canSearch: () => boolean
  onConfirm: (point: Coordinates) => void
  /** A dónde va el foco tras confirmar: al dato que sigue. */
  focusAfterConfirm?: FocusTarget
  /** A dónde va el foco al volver a editar: al campo de la dirección. */
  focusAfterEdit?: FocusTarget
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
  focusAfterConfirm,
  focusAfterEdit,
  locate,
  createMap,
}: AddressConfirmationProps) => {
  const { search, start, close } = useAddressSearch(locate)
  // La ventana pregunta a dónde llevar el foco al cerrarse; depende de si se confirmó o se va a editar.
  const focusOnClose = useRef(focusAfterEdit)

  const handleSearch = () => {
    if (canSearch()) void start(location)
  }

  const handleConfirm = (point: Coordinates) => {
    focusOnClose.current = focusAfterConfirm
    onConfirm(point)
    close()
  }

  const handleEdit = () => {
    focusOnClose.current = focusAfterEdit
    close()
  }

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
              Dirección confirmada en el mapa.
            </p>
          )}

          <AddressMapDialog
            open={search.status === 'reviewing'}
            address={formatAddress(location)}
            review={search.review}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            finalFocus={() => focusOnClose.current?.() ?? null}
            createMap={createMap}
          />
        </div>
      )}
    </FormGroup>
  )
}

export default AddressConfirmation
