import { useEffect, useEffectEvent, useState } from 'react'

export interface AsyncData<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | undefined
}

interface Settled<T> {
  key: string
  data?: T
  error?: Error
}

const toError = (reason: unknown) => (reason instanceof Error ? reason : new Error(String(reason)))

/** Ejecuta `load` cada vez que cambia `key` e ignora las respuestas de claves anteriores. */
export const useAsyncData = <T>(load: () => Promise<T>, key: string): AsyncData<T> => {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const runLoad = useEffectEvent(load)

  useEffect(() => {
    let active = true

    runLoad()
      .then((data) => {
        if (active) setSettled({ key, data })
      })
      .catch((reason: unknown) => {
        if (active) setSettled({ key, error: toError(reason) })
      })

    return () => {
      active = false
    }
  }, [key])

  const current = settled?.key === key ? settled : null

  return { data: current?.data, isLoading: current === null, error: current?.error }
}
