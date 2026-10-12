import { useEffect, useState } from 'react'
import { CaptchaFailedError, CodeRequestTooSoonError } from '@/features/auth/services/authErrors'
import type { CodeResendFailure } from '@/features/auth/types/auth.types'
import { toFailure } from '@/features/auth/utils/accessFailure'

/** Lo que se espera entre un código y el siguiente: lo mismo que Supabase exige entre dos envíos. */
export const RESEND_WAIT_SECONDS = 60

type ResendStatus = 'idle' | 'sending' | 'sent' | CodeResendFailure

const toResendFailure = toFailure<CodeResendFailure>(
  [
    [CodeRequestTooSoonError, 'tooSoon'],
    [CaptchaFailedError, 'captcha'],
  ],
  'failed',
)

interface ResendCodeOptions {
  /** Envía otro código; se rechaza si no se pudo. */
  onResend: () => Promise<void>
  /** Si un código acaba de enviarse: entonces hay que esperar antes de pedir otro. */
  justSent?: boolean
}

/**
 * Pedir otro código. Si uno acaba de enviarse empieza esperando, y vuelve a esperar después de cada envío. Si
 * Supabase dice que es demasiado pronto, también.
 */
export const useResendCode = ({ onResend, justSent = true }: ResendCodeOptions) => {
  const [secondsLeft, setSecondsLeft] = useState(justSent ? RESEND_WAIT_SECONDS : 0)
  const [status, setStatus] = useState<ResendStatus>('idle')

  useEffect(() => {
    if (secondsLeft <= 0) return

    const tick = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)

    return () => clearTimeout(tick)
  }, [secondsLeft])

  const resend = async () => {
    if (secondsLeft > 0 || status === 'sending') return

    setStatus('sending')
    try {
      await onResend()
      setStatus('sent')
      setSecondsLeft(RESEND_WAIT_SECONDS)
    } catch (reason) {
      const failure = toResendFailure(reason)
      setStatus(failure)
      if (failure === 'tooSoon') setSecondsLeft(RESEND_WAIT_SECONDS)
    }
  }

  return { secondsLeft, status, resend }
}
