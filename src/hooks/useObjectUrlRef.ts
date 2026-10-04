import { useCallback } from 'react'

/**
 * Ref para un `<img>` que muestra un archivo elegido por la persona: le pone una dirección temporal
 * y la libera cuando la imagen deja de mostrarse o cambia de archivo.
 */
export const useObjectUrlRef = (file: File) =>
  useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return

      const url = URL.createObjectURL(file)
      image.src = url

      return () => URL.revokeObjectURL(url)
    },
    [file],
  )
