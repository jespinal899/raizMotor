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
import type { ReportService } from '@/features/properties/types/report.types'

interface ReportPropertyDialogProps {
  /** El anuncio, o el proyecto, que se reporta. */
  propertyId: string
  /** Quien recibe el reporte: el de anuncios, salvo que se reporte otra cosa, como un proyecto. */
  service?: ReportService
  /** Qué se reporta, para la explicación de la ventana. */
  subject?: string
}

/**
 * Botón "Reportar" de la ficha y la ventana que abre. El formulario solo existe mientras está abierta:
 * al cerrarla se olvida lo elegido, y la próxima vez es otro reporte.
 */
const ReportPropertyDialog = ({ propertyId, service = reportService, subject = 'este anuncio' }: ReportPropertyDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" size="lg" className="h-11 px-3" />}>
        <Flag />
        Reportar
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Reportar publicación</DialogTitle>
          <DialogDescription>Cuéntanos qué pasa con {subject} para que podamos revisarlo.</DialogDescription>
        </DialogHeader>

        <ReportPropertyForm
          onSubmit={(report, operationKey) => service.report({ propertyId, ...report }, operationKey)}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ReportPropertyDialog
