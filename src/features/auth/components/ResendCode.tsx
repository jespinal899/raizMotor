import { CircleAlert, MailCheck, RotateCw, ShieldAlert, Timer } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import { Button } from '@/components/ui/button'
import { useResendCode } from '@/features/auth/hooks/useResendCode'

const ALERTS: Record<string, StatusAlertContent> = {
  sent: {
    icon: MailCheck,
    title: 'Te enviamos otro código',
    description: 'Usa el más reciente: los anteriores dejan de valer. Si no lo ves, revisa el correo no deseado.',
  },
  tooSoon: {
    icon: Timer,
    title: 'Espera un momento',
    description: 'Acabamos de enviarte un código. Podrás pedir otro en un minuto.',
  },
  captcha: {
    icon: ShieldAlert,
    title: 'No pudimos comprobar que no eres un robot',
    description: 'Si aparece una casilla, márcala. Si no, vuelve a intentarlo en unos segundos.',
    variant: 'destructive',
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos enviar otro código',
    description: 'Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
}

interface ResendCodeProps {
  onResend: () => Promise<void>
  /** Si un código acaba de enviarse: entonces hay que esperar un minuto para pedir otro. */
  justSent?: boolean
}

/** «Reenviar código», disponible un minuto después de cada envío, y lo que pasó al pedirlo. */
const ResendCode = ({ onResend, justSent }: ResendCodeProps) => {
  const { secondsLeft, status, resend } = useResendCode({ onResend, justSent })
  const waiting = secondsLeft > 0
  const alert = ALERTS[status]

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11"
        disabled={waiting || status === 'sending'}
        onClick={() => void resend()}
      >
        <RotateCw />
        {waiting ? `Reenviar código en ${secondsLeft} s` : status === 'sending' ? 'Enviando…' : 'Reenviar código'}
      </Button>
      {alert && <StatusAlert role={status === 'sent' ? 'status' : undefined} {...alert} />}
    </>
  )
}

export default ResendCode
