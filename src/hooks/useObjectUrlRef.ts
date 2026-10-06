import { useCallback } from 'react'

/**
 * Ref para un `<img>` que muestra un archivo del navegador, elegido por la persona o ya guardado: le pone
 * una dirección temporal y la libera cuando la imagen deja de mostrarse o cambia de archivo.
 */
export const useObjectUrlRef = (file: Blob) =>
  useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return

      const url = URL.createObjectURL(file)
      image.src = url

      return () => URL.revokeObjectURL(url)
    },
    [file],
  )
