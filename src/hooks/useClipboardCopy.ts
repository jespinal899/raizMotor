import { useState } from 'react'

/** `failed` significa que el navegador no dejó copiar: hay que ofrecer el texto para copiarlo a mano. */
export type ClipboardCopyStatus = 'idle' | 'copied' | 'failed'

/** Copia un texto al portapapeles y dice si se pudo. Nunca da por copiado lo que el navegador rechazó. */
export const useClipboardCopy = (text: string) => {
  const [status, setStatus] = useState<ClipboardCopyStatus>('idle')

  const copy = async () => {
    try {
      // Sin HTTPS, o con el permiso denegado, el navegador no ofrece el portapapeles o rechaza la escritura.
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return { status, copy }
}
