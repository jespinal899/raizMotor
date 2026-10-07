import type { Property } from '@/features/properties/types/property.types'
import { formatPrice, formatPriceInLempiras } from '@/shared/utils/format'

type ShareSource = Pick<Property, 'title' | 'price' | 'operation' | 'district' | 'city'>

const WHATSAPP_SHARE_URL = 'https://wa.me/'

/**
 * Resumen de una línea que acompaña al enlace al compartir la ficha: título, precio y ubicación. El precio
 * va en dólares y, entre paréntesis, su equivalente aproximado en lempiras.
 */
export const buildShareText = ({ title, price, operation, district, city }: ShareSource): string => {
  const bothCurrencies = `${formatPrice(price)} (≈ ${formatPriceInLempiras(price)})`
  const amount = operation === 'alquiler' ? `${bothCurrencies} al mes` : bothCurrencies

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
