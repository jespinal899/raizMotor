/**
 * El buzón de prueba del Supabase local (Mailpit): ahí llegan los correos de las cuentas en las pruebas, en
 * lugar de salir a internet. Las pruebas leen de él el código de verificación, como lo haría una persona.
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324'

interface MailpitMessage {
  ID: string
  Subject: string
  To: { Address: string }[]
  Created: string
}

/**
 * El código de 6 dígitos del correo más reciente enviado a esa dirección cuyo asunto contiene `subject`.
 * Espera a que llegue: Supabase lo envía unos instantes después de la petición.
 */
export const latestCode = async (email: string, subject: string, timeoutMs = 15_000): Promise<string> => {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const response = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
    const { messages = [] } = (await response.json()) as { messages?: MailpitMessage[] }
    const [latest] = messages
      .filter((message) => message.Subject.includes(subject))
      .sort((a, b) => b.Created.localeCompare(a.Created))

    if (latest) {
      const detail = (await (await fetch(`${MAILPIT}/api/v1/message/${latest.ID}`)).json()) as { Text: string }
      const code = detail.Text.match(/\b(\d{6})\b/)?.[1]
      if (code) return code
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`No llegó a ${email} ningún correo con «${subject}».`)
}
