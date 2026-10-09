import type { Property } from '@/features/properties/types/property.types'
import { BRAND } from '@/shared/constants/brand'
import { formatPrice, formatPriceInLempiras } from '@/shared/utils/format'
import { whatsAppUrl } from '@/shared/utils/whatsApp'

type ShareSource = Pick<Property, 'title' | 'price' | 'operation' | 'district' | 'city'>

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
export const buildWhatsAppShareUrl = (text: string, url: string): string => whatsAppUrl(`${text}\n${url}`)

/**
 * Dirección que abre WhatsApp con el teléfono de quien publica y un mensaje que cita su anuncio. Tampoco
 * envía nada: lo hace quien escribe.
 */
export const buildAdvertiserChatUrl = (title: string, url: string, phone: string): string =>
  whatsAppUrl(`Hola, vi tu anuncio «${title}» en ${BRAND.name} y me interesa.\n${url}`, phone)
