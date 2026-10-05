import { useRef, useState } from 'react'
import { createOperationKey } from '@/shared/utils/operationKey'

interface AttemptOptions<Failure, Success> {
  /** Traduce el motivo de un rechazo al estado que explica por qué no se pudo. */
  toFailure: (reason: unknown) => Failure
  /**
   * Estado en que queda la acción cuando termina bien. Sin él vuelve al reposo: es lo indicado cuando
   * después se cambia de página, como al entrar.
   */
  succeeded?: Success
}

/**
 * Estado de una acción que puede tardar y fallar, como entrar, enviar un mensaje o publicar: en reposo,
 * en curso (con el nombre de la vía que se intenta), terminada o el motivo del fallo.
 *
 * Repetirla no la duplica. Mientras está en curso, o cuando ya terminó bien con los mismos datos, pedirla
 * otra vez no la vuelve a ejecutar. Además recibe una clave que identifica la operación y se mantiene al
 * reintentar tras un fallo, para que el servicio pueda reconocer el reintento y no repetir el efecto.
 */
export const useAttempt = <InProgress extends string, Failure extends string, Success extends string = never>({
  toFailure,
  succeeded,
}: AttemptOptions<Failure, Success>) => {
  const [status, setStatus] = useState<'idle' | InProgress | Failure | Success>('idle')
  const running = useRef<Promise<void> | null>(null)
  const operationKey = useRef<string | null>(null)
  const isDone = useRef(false)
  /** Cuenta los cambios de datos, para saber si hubo alguno mientras la acción estaba en curso. */
  const dataVersion = useRef(0)

  const run = async (inProgress: InProgress, action: (operationKey: string) => Promise<void>) => {
    const versionAtStart = dataVersion.current
    operationKey.current ??= createOperationKey()
    setStatus(inProgress)

    try {
      await action(operationKey.current)
      // Lo que terminó es lo que se envió: si los datos cambiaron entretanto, lo nuevo sigue pendiente.
      isDone.current = succeeded !== undefined && dataVersion.current === versionAtStart
      setStatus(succeeded ?? 'idle')
    } catch (reason) {
      setStatus(toFailure(reason))
    }
  }

  const attempt = (inProgress: InProgress, action: (operationKey: string) => Promise<void>): Promise<void> => {
    if (isDone.current) return Promise.resolve()

    if (!running.current) {
      // `finally` se ejecuta siempre después de guardar la promesa, también si la acción falla al instante.
      running.current = run(inProgress, action).finally(() => {
        running.current = null
      })
    }

    return running.current
  }

  /** Los datos cambiaron: lo siguiente que se intente es otra operación, con otra clave. */
  const reset = () => {
    dataVersion.current += 1
    operationKey.current = null
    isDone.current = false
    // Un intento en curso sigue siendo el de los datos anteriores: su estado no se toca.
    if (!running.current) setStatus('idle')
  }

  return { status, attempt, reset }
}
