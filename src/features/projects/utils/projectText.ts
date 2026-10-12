import { BRAND } from '@/shared/constants/brand'
import { whatsAppUrl } from '@/shared/utils/whatsApp'

const deliveryFormatter = new Intl.DateTimeFormat('es-HN', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** La fecha de entrega como se anuncia: «diciembre de 2027». */
export const formatDelivery = (isoDate: string) => deliveryFormatter.format(new Date(`${isoDate}T00:00:00Z`))

/** El chat de WhatsApp con la desarrolladora, con el proyecto y su enlace ya escritos. */
export const buildDeveloperChatUrl = (projectName: string, url: string, phone: string) =>
  whatsAppUrl(`Hola, vi el proyecto «${projectName}» en ${BRAND.name} y quiero más información.\n${url}`, phone)
