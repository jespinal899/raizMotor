// La lógica de «Contacta al publicador», sin nada propio de Deno ni de Supabase: así se prueba con Vitest
// (contact.test.ts). index.ts la conecta con la base de datos, con Resend y con Cloudflare Turnstile.

const BRAND = 'DomusRaíz'
const MAX_FULL_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const MAX_CAPTCHA_LENGTH = 2048

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const OPERATION_KEY = /^[A-Za-z0-9_-]{1,64}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** +504 y ocho dígitos, empezando por 2, 3, 7, 8 o 9: la misma regla del formulario. */
const HONDURAN_PHONE = /^\+504[23789]\d{7}$/

/** Lo que manda el sitio. */
export interface ContactRequest {
  propertyId: string
  fullName: string
  email: string
  phone: string
  operationKey: string
  captchaToken?: string
}

/** Lo que la base de datos entrega al reservar el envío. */
export type Claim =
  | { outcome: 'already_sent' }
  | { outcome: 'claimed'; ownerEmail: string; publisherName: string; propertyTitle: string }

export interface OutgoingEmail {
  to: string
  replyTo: string
  subject: string
  html: string
  text: string
}

/** Un fallo de la base de datos: su `code` dice el motivo (supabase/migrations). */
export interface DatabaseError {
  code?: string
  message?: string
}

export interface ContactDependencies {
  /** Reserva el envío en la base de datos; rechaza con su fallo. */
  claim(propertyId: string, operationKey: string, senderFingerprint: string): Promise<Claim>
  /** Libera la reserva si el correo no salió, para que el reintento lo envíe. */
  release(operationKey: string): Promise<void>
  /** Envía el correo; rechaza si el proveedor no lo aceptó. */
  sendEmail(email: OutgoingEmail): Promise<void>
  /** Comprueba el token de la verificación contra bots; `null` si el sitio no la exige. */
  verifyCaptcha: ((token: string, ip: string | null) => Promise<boolean>) | null
  /** La huella de la IP: nunca se guarda la IP tal cual. */
  fingerprint(ip: string): Promise<string>
  /** Dirección del sitio publicado, sin barra final: con ella se enlaza el anuncio. */
  siteUrl: string
  /** Desde qué páginas se puede llamar a la función. */
  allowedOrigins: string[]
}

type Parsed = { ok: true; value: ContactRequest } | { ok: false; field: string }

const isText = (value: unknown): value is string => typeof value === 'string'

/** Lo que llega se comprueba entero: viene de un navegador y nada de ello es de fiar. */
export const parseContactRequest = (body: unknown): Parsed => {
  if (typeof body !== 'object' || body === null) return { ok: false, field: 'body' }
  const { propertyId, fullName, email, phone, operationKey, captchaToken } = body as Record<string, unknown>

  if (!isText(propertyId) || !UUID.test(propertyId)) return { ok: false, field: 'propertyId' }

  const name = isText(fullName) ? fullName.trim().replace(/\s+/g, ' ') : ''
  if (!/\S\s+\S/.test(name) || name.length > MAX_FULL_NAME_LENGTH) return { ok: false, field: 'fullName' }

  const address = isText(email) ? email.trim() : ''
  if (!EMAIL.test(address) || address.length > MAX_EMAIL_LENGTH) return { ok: false, field: 'email' }

  if (!isText(phone) || !HONDURAN_PHONE.test(phone)) return { ok: false, field: 'phone' }
  if (!isText(operationKey) || !OPERATION_KEY.test(operationKey)) return { ok: false, field: 'operationKey' }

  if (captchaToken !== undefined && (!isText(captchaToken) || captchaToken.length > MAX_CAPTCHA_LENGTH)) {
    return { ok: false, field: 'captchaToken' }
  }

  return {
    ok: true,
    value: { propertyId, fullName: name, email: address, phone, operationKey, ...(captchaToken ? { captchaToken } : {}) },
  }
}

/** Lo que escribe quien visita va dentro de un HTML: nunca como etiquetas. */
export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)

/** La IP de quien llama, según las cabeceras que añade Supabase. Primero la de Cloudflare, que no se puede falsear. */
export const clientIp = (headers: Headers): string | null => {
  const raw = headers.get('cf-connecting-ip') ?? headers.get('x-real-ip') ?? headers.get('x-forwarded-for') ?? ''
  const ip = raw.split(',')[0].trim()

  return ip || null
}

/** El teléfono como se lee en Honduras: «+504 9999-9999». */
const formatPhone = (phone: string) => `+504 ${phone.slice(4, 8)}-${phone.slice(8)}`

/** El correo que recibe quien publicó: los datos de quien quiere que lo contacte, y nada más. */
export const buildPublisherEmail = (
  { fullName, email, phone, propertyId }: ContactRequest,
  { ownerEmail, publisherName, propertyTitle }: Extract<Claim, { outcome: 'claimed' }>,
  siteUrl: string,
): OutgoingEmail => {
  const listingUrl = `${siteUrl}/propiedad/${propertyId}`
  const title = propertyTitle.replace(/[\r\n]+/g, ' ')
  const greeting = publisherName.trim() ? `Hola, ${publisherName.trim()}:` : 'Hola:'
  const whatsApp = `https://wa.me/${phone.replace(/\D/g, '')}`

  const text = [
    greeting,
    '',
    `${fullName} vio tu anuncio «${title}» en ${BRAND} y quiere que lo contactes.`,
    '',
    `Nombre: ${fullName}`,
    `Correo: ${email}`,
    `Teléfono: ${formatPhone(phone)}`,
    '',
    `Ver el anuncio: ${listingUrl}`,
    '',
    'Si respondes a este correo, le escribes directamente.',
    '',
    `Recibes este correo porque publicaste este anuncio en ${BRAND}. ${BRAND} no guarda los datos de quien te escribe.`,
  ].join('\n')

  const html = `<div style="font-family: Arial, Helvetica, sans-serif; color: #1f2933; max-width: 520px; margin: 0 auto; padding: 24px">
  <p style="line-height: 1.5">${escapeHtml(greeting)}</p>
  <p style="line-height: 1.5"><strong>${escapeHtml(fullName)}</strong> vio tu anuncio «<a href="${escapeHtml(listingUrl)}" style="color: #0f4c81">${escapeHtml(title)}</a>» en ${BRAND} y quiere que lo contactes.</p>
  <table style="border-collapse: collapse; margin: 16px 0">
    <tr><td style="padding: 4px 12px 4px 0; color: #52606d">Nombre</td><td style="padding: 4px 0">${escapeHtml(fullName)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #52606d">Correo</td><td style="padding: 4px 0"><a href="mailto:${escapeHtml(email)}" style="color: #0f4c81">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #52606d">Teléfono</td><td style="padding: 4px 0"><a href="tel:${escapeHtml(phone)}" style="color: #0f4c81">${escapeHtml(formatPhone(phone))}</a> · <a href="${escapeHtml(whatsApp)}" style="color: #0f4c81">WhatsApp</a></td></tr>
  </table>
  <p style="line-height: 1.5">Si respondes a este correo, le escribes directamente.</p>
  <p style="line-height: 1.5; color: #52606d; font-size: 13px">Recibes este correo porque publicaste este anuncio en ${BRAND}. ${BRAND} no guarda los datos de quien te escribe.</p>
</div>`

  return {
    to: ownerEmail,
    replyTo: email,
    subject: `Nuevo interesado en tu anuncio «${title}»`,
    html,
    text,
  }
}

/** Qué responde la función ante cada fallo de la base de datos. */
const DATABASE_FAILURES: Record<string, { status: number; error: string }> = {
  RZ002: { status: 400, error: 'invalid' },
  RZ003: { status: 404, error: 'not_found' },
  RZ004: { status: 429, error: 'too_many_contacts' },
}

const corsHeaders = (origin: string | null, allowedOrigins: string[]): Record<string, string> => ({
  ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
})

/** Atiende una petición del sitio: comprueba, reserva el envío, manda el correo y lo libera si no salió. */
export const handleContact = async (request: Request, deps: ContactDependencies): Promise<Response> => {
  const cors = corsHeaders(request.headers.get('origin'), deps.allowedOrigins)
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return reply(400, { error: 'invalid', field: 'body' })
  }

  const parsed = parseContactRequest(body)
  if (!parsed.ok) return reply(400, { error: 'invalid', field: parsed.field })
  const contact = parsed.value

  const ip = clientIp(request.headers)
  if (deps.verifyCaptcha) {
    const passed = contact.captchaToken ? await deps.verifyCaptcha(contact.captchaToken, ip) : false
    if (!passed) return reply(403, { error: 'captcha_failed' })
  }

  let claim: Claim
  try {
    claim = await deps.claim(contact.propertyId, contact.operationKey, await deps.fingerprint(ip ?? 'unknown'))
  } catch (reason) {
    const known = DATABASE_FAILURES[(reason as DatabaseError)?.code ?? '']
    return known ? reply(known.status, { error: known.error }) : reply(500, { error: 'unexpected' })
  }

  // Un reintento de un envío que ya salió no manda otro correo.
  if (claim.outcome === 'already_sent') return reply(200, { sent: true })

  try {
    await deps.sendEmail(buildPublisherEmail(contact, claim, deps.siteUrl))
  } catch {
    await deps.release(contact.operationKey).catch(() => {})
    return reply(502, { error: 'email_failed' })
  }

  return reply(200, { sent: true })
}
