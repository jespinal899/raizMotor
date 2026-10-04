import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import LocationMapView from '@/features/properties/components/LocationMapView'
import type { AddressReview, ReviewPrecision } from '@/features/properties/hooks/useAddressSearch'
import type { CreateLocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates } from '@/features/properties/types/publication.types'

interface AddressMapReviewProps {
  /** Dirección escrita, para que la persona la reconozca. */
  address: string
  review: AddressReview
  onConfirm: (point: Coordinates) => void
  onEdit: () => void
  createMap?: CreateLocationMap
}

const SEARCH_RESULT: Record<ReviewPrecision, string> = {
  neighborhood: 'Encontramos la zona.',
  city: 'No encontramos la colonia, así que el mapa muestra la ciudad.',
  department: 'No pudimos encontrar la dirección, así que el mapa muestra la cabecera del departamento.',
}

const HOW_TO_CORRECT = 'Si el marcador no está sobre la propiedad, arrastra el marcador o toca el mapa en el punto correcto.'

/** Contenido de la ventana de confirmación. Se monta en cada apertura: el marcador parte siempre del punto encontrado. */
const AddressMapReview = ({ address, review, onConfirm, onEdit, createMap }: AddressMapReviewProps) => {
  const [point, setPoint] = useState(review.view.center)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg">¿La dirección es correcta?</DialogTitle>
        <DialogDescription>
          {SEARCH_RESULT[review.precision]} {HOW_TO_CORRECT}
        </DialogDescription>
      </DialogHeader>

      <p className="font-medium">{address}</p>

      <LocationMapView
        view={review.view}
        label="Mapa para confirmar la dirección"
        onMarkerMove={setPoint}
        createMap={createMap}
      />

      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onEdit}>
          Editar dirección
        </Button>
        <Button type="button" size="lg" onClick={() => onConfirm(point)}>
          Confirmar dirección
        </Button>
      </DialogFooter>
    </>
  )
}

export default AddressMapReview
