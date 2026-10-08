import { Send } from 'lucide-react'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import StatusAlert from '@/components/StatusAlert'

const BEFORE_SENDING = 'Se abrirá WhatsApp con tu solicitud ya escrita. Tu plan se activa cuando confirmemos el pago.'

/** Abrir el chat no es enviar el mensaje, y desde aquí no se sabe si se envió: se dice lo que falta. */
const NEXT_STEP = {
  icon: Send,
  title: 'Falta un paso: envía el mensaje en WhatsApp',
  description:
    'Abrimos WhatsApp con tu solicitud ya escrita. Hasta que lo envíes no nos llega. Te responderemos con ' +
    'las instrucciones de pago, y tu plan se activa cuando lo confirmemos.',
}

interface PlanRequestNoticeProps {
  /** La dirección del chat ya abierto; sin ella, el chat aún no se abrió. */
  chatUrl?: string
}

/** Lo que pasa al pedir el plan por WhatsApp: antes de abrir el chat, lo anuncia; después, recuerda lo que falta. */
const PlanRequestNotice = ({ chatUrl }: PlanRequestNoticeProps) => {
  if (!chatUrl) return <p className="text-sm text-muted-foreground">{BEFORE_SENDING}</p>

  return (
    <>
      <StatusAlert role="status" {...NEXT_STEP} />
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        ¿No se abrió WhatsApp?{' '}
        <ExternalButtonLink href={chatUrl} variant="link" className="h-auto p-0">
          Abrir WhatsApp de nuevo
        </ExternalButtonLink>
      </p>
    </>
  )
}

export default PlanRequestNotice
