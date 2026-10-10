import { useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CircleAlert } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import FormField from '@/components/FormField'
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
import { Textarea } from '@/components/ui/textarea'
import { useAttempt } from '@/hooks/useAttempt'

const MAX_NOTE_LENGTH = 500

interface ModerationActionButtonProps {
  /** Texto del botón y de la confirmación, p. ej. "Ocultar anuncio". */
  label: string
  icon: LucideIcon
  /** Pregunta de la ventana, p. ej. "¿Ocultar este anuncio?". */
  title: string
  /** Qué pasará al confirmar. */
  description: ReactNode
  busyLabel: string
  variant?: 'default' | 'outline' | 'destructive'
  /** Campos propios de la acción, entre la descripción y la nota. */
  children?: ReactNode
  /** Si lo escrito en los campos propios permite confirmar. */
  canConfirm?: boolean
  /** Se resuelve cuando la decisión quedó guardada; se rechaza si no se pudo. */
  onConfirm: (note: string) => Promise<void>
  /** Después de guardarla, p. ej. para volver a leer la lista. */
  onDone: () => void
}

/**
 * Botón de una decisión del equipo y la ventana que pide confirmarla, con una nota opcional que queda en el
 * registro de moderación. Si no se pudo guardar, la ventana sigue abierta y lo dice.
 */
const ModerationActionButton = ({
  label,
  icon,
  title,
  description,
  busyLabel,
  variant = 'outline',
  children,
  canConfirm = true,
  onConfirm,
  onDone,
}: ModerationActionButtonProps) => {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const { status, attempt, reset } = useAttempt<'saving', 'failed'>({ toFailure: () => 'failed' })
  const Icon = icon

  const confirm = async () => {
    await attempt('saving', async () => {
      await onConfirm(note.trim())
      setOpen(false)
      setNote('')
      onDone()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button type="button" variant={variant === 'destructive' ? 'outline' : variant} />}>
        <Icon />
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}

        <FormField label="Nota para el registro" hint="opcional">
          {(control) => (
            <Textarea
              {...control}
              value={note}
              maxLength={MAX_NOTE_LENGTH}
              rows={3}
              onChange={(event) => setNote(event.target.value)}
            />
          )}
        </FormField>

        {status === 'failed' && (
          <StatusAlert
            icon={CircleAlert}
            title="No pudimos guardar la decisión"
            description="No cambió nada. Inténtalo de nuevo en unos minutos."
            variant="destructive"
          />
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <BusyButton
            variant={variant === 'outline' ? 'default' : variant}
            isBusy={status === 'saving'}
            disabled={!canConfirm}
            icon={Icon}
            busyLabel={busyLabel}
            onClick={() => void confirm()}
          >
            {label}
          </BusyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ModerationActionButton
