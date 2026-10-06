import type { Property } from '@/features/properties/types/property.types'
import { formatPrice } from '@/shared/utils/format'

type ShareSource = Pick<Property, 'title' | 'price' | 'operation' | 'district' | 'city'>

const WHATSAPP_SHARE_URL = 'https://wa.me/'

/** Resumen de una línea que acompaña al enlace al compartir la ficha: título, precio y ubicación. */
export const buildShareText = ({ title, price, operation, district, city }: ShareSource): string => {
  const amount = operation === 'alquiler' ? `${formatPrice(price)} al mes` : formatPrice(price)

  return [title, amount, `${district}, ${city}`].join(' · ')
}

/**
 * Dirección que abre WhatsApp con el resumen y el enlace ya escritos. No lleva número: quien comparte
 * elige a quién enviarlo.
 */
export const buildWhatsAppShareUrl = (text: string, url: string): string => {
  const share = new URL(WHATSAPP_SHARE_URL)
  share.searchParams.set('text', `${text}\n${url}`)

  return share.href
}
