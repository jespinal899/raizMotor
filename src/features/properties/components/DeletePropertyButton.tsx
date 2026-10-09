import { CircleAlert, Trash2 } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import StatusAlert from '@/components/StatusAlert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAttempt } from '@/hooks/useAttempt'

interface DeletePropertyButtonProps {
  /** Título del anuncio, para que quien confirma vea cuál va a eliminar. */
  title: string
  /** Se resuelve cuando el anuncio quedó eliminado; se rechaza si no se pudo. */
  onDelete: () => Promise<void>
}

/**
 * Botón «Eliminar» de un anuncio propio y la ventana que pide confirmarlo: borrar no se puede deshacer.
 * Cuando el anuncio se elimina, quien lo listaba lo retira y esta ventana desaparece con él.
 */
const DeletePropertyButton = ({ title, onDelete }: DeletePropertyButtonProps) => {
  const { status, attempt } = useAttempt<'removing', 'failed'>({ toFailure: () => 'failed' })

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <Trash2 />
        Eliminar
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">¿Eliminar este anuncio?</DialogTitle>
          <DialogDescription>
            «{title}» dejará de verse en el catálogo y sus fotos se borrarán. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {status === 'failed' && (
          <StatusAlert
            icon={CircleAlert}
            title="No pudimos eliminar el anuncio"
            description="Sigue publicado. Inténtalo de nuevo en unos minutos."
            variant="destructive"
          />
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <BusyButton
            variant="destructive"
            isBusy={status === 'removing'}
            icon={Trash2}
            busyLabel="Eliminando…"
            onClick={() => void attempt('removing', onDelete)}
          >
            Eliminar anuncio
          </BusyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePropertyButton
