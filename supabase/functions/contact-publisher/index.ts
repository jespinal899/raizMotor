// «Contacta al publicador» y «Cotizar» de los proyectos: recibe del sitio los datos de quien ve un anuncio o un
// proyecto y se los envía por correo, con Resend, a quien lo publicó. El correo del publicador se lee aquí, con la clave de servicio, y nunca llega
// al navegador. La lógica está en contact.ts; aquí solo se conecta con Supabase, Resend y Turnstile.
//
// Se publica con: supabase functions deploy contact-publisher --no-verify-jwt
// (quien escribe no necesita sesión). Los secretos que usa están en el README.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { handleContact } from './contact.ts'
import type { Claim, OutgoingEmail } from './contact.ts'

const required = (name: string): string => {
  const value = Deno.env.get(name)?.trim()
  if (!value) throw new Error(`Falta el secreto ${name}.`)

  return value
}

const supabase = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
})

const RESEND_API_KEY = required('RESEND_API_KEY')
const CONTACT_FROM_EMAIL = required('CONTACT_FROM_EMAIL')
const SITE_URL = required('SITE_URL').replace(/\/+$/, '')
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? SITE_URL)
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)
const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')?.trim() || null

/** La reserva del envío, tal como la entrega la base de datos (supabase/migrations). */
const toClaim = (data: unknown): Claim => {
  const [row] = (data ?? []) as {
    outcome: string
    owner_email: string | null
    publisher_name: string | null
    property_title?: string | null
    project_name?: string | null
  }[]
  if (!row) throw new Error('La base de datos no respondió.')
  if (row.outcome === 'already_sent') return { outcome: 'already_sent' }

  return {
    outcome: 'claimed',
    ownerEmail: row.owner_email ?? '',
    publisherName: row.publisher_name ?? '',
    propertyTitle: row.property_title ?? row.project_name ?? '',
  }
}

const claim = async (propertyId: string, operationKey: string, senderFingerprint: string): Promise<Claim> => {
  const { data, error } = await supabase.rpc('claim_publisher_contact', {
    target_property: propertyId,
    contact_key: operationKey,
    sender_fingerprint: senderFingerprint,
  })
  if (error) throw error

  return toClaim(data)
}

const claimProject = async (projectId: string, operationKey: string, senderFingerprint: string): Promise<Claim> => {
  const { data, error } = await supabase.rpc('claim_project_contact', {
    target_project: projectId,
    contact_key: operationKey,
    sender_fingerprint: senderFingerprint,
  })
  if (error) throw error

  return toClaim(data)
}

const release = async (operationKey: string) => {
  const { error } = await supabase.rpc('release_publisher_contact', { contact_key: operationKey })
  if (error) throw error
}

const sendEmail = async ({ to, replyTo, subject, html, text }: OutgoingEmail) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: CONTACT_FROM_EMAIL, to: [to], reply_to: replyTo, subject, html, text }),
  })
  if (!response.ok) throw new Error(`Resend respondió ${response.status}.`)
}

const verifyCaptcha = async (token: string, ip: string | null) => {
  const form = new FormData()
  form.append('secret', TURNSTILE_SECRET_KEY ?? '')
  form.append('response', token)
  if (ip) form.append('remoteip', ip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  if (!response.ok) return false

  const result = (await response.json()) as { success?: boolean }

  return result.success === true
}

const fingerprint = async (ip: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip))

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve((request) =>
  handleContact(request, {
    claim,
    claimProject,
    release,
    sendEmail,
    verifyCaptcha: TURNSTILE_SECRET_KEY ? verifyCaptcha : null,
    fingerprint,
    siteUrl: SITE_URL,
    allowedOrigins: ALLOWED_ORIGINS,
  }),
)
