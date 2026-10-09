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
  /** Título de la publicación, para que quien confirma vea cuál va a eliminar. */
  title: string
  /** Se resuelve cuando quedó eliminada; se rechaza si no se pudo. */
  onDelete: () => Promise<void>
}

/**
 * Botón «Eliminar» de una publicación propia, esté en el catálogo o no, y la ventana que pide confirmarlo:
 * borrar no se puede deshacer. Cuando se elimina, quien la listaba la retira y esta ventana desaparece con ella.
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
          <DialogTitle className="text-lg">¿Eliminar esta publicación?</DialogTitle>
          <DialogDescription>
            «{title}» se borrará con sus fotos y ya no podrás volver a publicarla. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {status === 'failed' && (
          <StatusAlert
            icon={CircleAlert}
            title="No pudimos eliminar la publicación"
            description="Sigue en tu lista. Inténtalo de nuevo en unos minutos."
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
            Eliminar publicación
          </BusyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePropertyButton
