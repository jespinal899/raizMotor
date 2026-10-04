import type { ContactFormStatus as Status } from '@/features/contact/types/contact.types'
import { cn } from '@/lib/utils'
import { CONTACT } from '@/shared/constants/contact'

type VisibleStatus = Exclude<Status, 'idle' | 'sending'>

const MESSAGES: Record<VisibleStatus, { text: string; role: 'status' | 'alert'; tone: string }> = {
  sent: {
    text: 'Recibimos tu mensaje. Te responderemos pronto.',
    role: 'status',
    tone: 'bg-primary/10 text-primary',
  },
  unavailable: {
    text: `El envío por correo aún no está activo. Mientras tanto, llámanos al ${CONTACT.phone.display}.`,
    role: 'status',
    tone: 'bg-muted text-foreground',
  },
  failed: {
    text: `No pudimos enviar tu mensaje. Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`,
    role: 'alert',
    tone: 'bg-destructive/10 text-destructive',
  },
}

const isVisible = (status: Status): status is VisibleStatus => Object.hasOwn(MESSAGES, status)

interface ContactFormStatusProps {
  status: Status
}

/** Resultado del envío. Nunca se muestra éxito si el mensaje no salió. */
const ContactFormStatus = ({ status }: ContactFormStatusProps) => {
  if (!isVisible(status)) return null

  const { text, role, tone } = MESSAGES[status]

  return (
    <p role={role} className={cn('rounded-lg px-4 py-3 text-sm', tone)}>
      {text}
    </p>
  )
}

export default ContactFormStatus
