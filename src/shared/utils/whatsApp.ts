const WHATSAPP_URL = 'https://wa.me/'

/**
 * Dirección que abre WhatsApp con un texto ya escrito. Con un número abre el chat con él; sin número,
 * quien la abre elige a quién enviarlo. En ningún caso envía nada: eso lo hace la persona.
 */
export const whatsAppUrl = (text: string, phoneE164 = ''): string => {
  const url = new URL(phoneE164.replace(/\D/g, ''), WHATSAPP_URL)
  url.searchParams.set('text', text)

  return url.href
}
