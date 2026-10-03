import { useEffect } from 'react'
import { BRAND } from '@/shared/constants/brand'

export const formatPageTitle = (title?: string) => (title ? `${title} | ${BRAND.name}` : BRAND.name)

/** Pone el título de la pestaña mientras la página está montada y lo restaura al salir. */
export const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = formatPageTitle(title)

    return () => {
      document.title = formatPageTitle()
    }
  }, [title])
}
