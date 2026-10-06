import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ReportPropertyForm from '@/features/properties/components/ReportPropertyForm'
import { reportService } from '@/features/properties/services/reportService'

interface ReportPropertyDialogProps {
  propertyId: string
}

/**
 * Botón "Reportar" de la ficha y la ventana que abre. El formulario solo existe mientras está abierta:
 * al cerrarla se olvida lo elegido, y la próxima vez es otro reporte.
 */
const ReportPropertyDialog = ({ propertyId }: ReportPropertyDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" size="lg" className="h-11 px-3" />}>
        <Flag />
        Reportar
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Reportar publicación</DialogTitle>
          <DialogDescription>Cuéntanos qué pasa con este anuncio para que podamos revisarlo.</DialogDescription>
        </DialogHeader>

        <ReportPropertyForm
          onSubmit={(report, operationKey) => reportService.report({ propertyId, ...report }, operationKey)}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ReportPropertyDialog
