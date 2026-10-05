import { useState } from 'react'

/**
 * Estado de una acción que puede tardar y fallar, como entrar o crear una cuenta: en reposo, en curso
 * (con el nombre de la vía que se está intentando) o el motivo del fallo, que traduce `toFailure`.
 */
export const useAttempt = <InProgress extends string, Failure extends string>(
  toFailure: (reason: unknown) => Failure,
) => {
  const [status, setStatus] = useState<'idle' | InProgress | Failure>('idle')

  const attempt = async (inProgress: InProgress, action: () => Promise<void>) => {
    setStatus(inProgress)
    try {
      await action()
      setStatus('idle')
    } catch (reason) {
      setStatus(toFailure(reason))
    }
  }

  const reset = () => setStatus('idle')

  return { status, attempt, reset }
}
