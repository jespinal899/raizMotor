import type { ContactTopic } from '@/features/contact/types/contact.types'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'
import { whatsAppUrl } from '@/shared/utils/whatsApp'

/** El chat con el equipo, con la consulta ya escrita: la propiedad o el plan por el que se llega, si hay uno. */
export const contactChatUrl = (topic?: ContactTopic): string => {
  const text = topic
    ? [topic.defaultDescription, topic.reference].filter(Boolean).join('\n')
    : `Hola, tengo una consulta sobre ${BRAND.name}.`

  return whatsAppUrl(text, CONTACT.phone.e164)
}
