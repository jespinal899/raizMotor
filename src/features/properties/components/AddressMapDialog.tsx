import { Dialog, DialogContent } from '@/components/ui/dialog'
import AddressMapReview from '@/features/properties/components/AddressMapReview'
import type { AddressReview } from '@/features/properties/hooks/useAddressSearch'
import type { CreateLocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates } from '@/features/properties/types/publication.types'

interface AddressMapDialogProps {
  open: boolean
  address: string
  /** Resultado de la búsqueda; falta mientras no se ha buscado ninguna dirección. */
  review: AddressReview | undefined
  onConfirm: (point: Coordinates) => void
  /** Cerrar la ventana sin confirmar (botón, tecla Escape o clic fuera) equivale a volver a editar. */
  onEdit: () => void
  /** A dónde va el foco al cerrarse; por defecto vuelve al botón que la abrió. */
  finalFocus?: () => HTMLElement | null
  createMap?: CreateLocationMap
}

/** Ventana emergente con el mapa para confirmar, o corregir, el punto de la dirección. */
const AddressMapDialog = ({ open, review, onEdit, finalFocus, ...reviewProps }: AddressMapDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onEdit()
      }}
    >
      <DialogContent
        showCloseButton={false}
        finalFocus={finalFocus}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl"
      >
        {review && <AddressMapReview review={review} onEdit={onEdit} {...reviewProps} />}
      </DialogContent>
    </Dialog>
  )
}

export default AddressMapDialog
