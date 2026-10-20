import { describe, expect, it, vi } from 'vitest'
import { buildPublisherEmail, clientIp, escapeHtml, handleContact, parseContactRequest } from './contact.ts'
import type { Claim, ContactDependencies } from './contact.ts'

const SITE = 'https://domusraiz.hn'
const PROPERTY_ID = '3f0c2a54-6f0e-4a35-9b6f-0d6f1f6c2a11'
const CONTACT = {
  propertyId: PROPERTY_ID,
  fullName: 'Ana Mejía',
  email: 'ana@ejemplo.hn',
  phone: '+50499998888',
  operationKey: 'clave-del-envio',
}
const CLAIMED: Claim = {
  outcome: 'claimed',
  ownerEmail: 'publicador@ejemplo.hn',
  publisherName: 'Carlos Pérez',
  propertyTitle: 'Casa amplia con patio en Palmira',
}

const PROJECT_ID = '0b9f8c1e-6f3a-4c8e-9a51-2f1c3d4e5f60'
const PROJECT_CONTACT = {
  projectId: PROJECT_ID,
  model: 'Modelo A',
  fullName: 'Ana Mejía',
  email: 'ana@ejemplo.hn',
  phone: '+50499998888',
  operationKey: 'clave-del-envio',
}
const PROJECT_CLAIMED: Claim = {
  outcome: 'claimed',
  ownerEmail: 'ventas@constructora.hn',
  publisherName: 'Constructora Norte',
  propertyTitle: 'Torre Vista Lomas',
}

const deps = (overrides: Partial<ContactDependencies> = {}): ContactDependencies => ({
  claim: vi.fn(async () => CLAIMED),
  claimProject: vi.fn(async () => PROJECT_CLAIMED),
  release: vi.fn(async () => {}),
  sendEmail: vi.fn(async () => {}),
  verifyCaptcha: null,
  fingerprint: vi.fn(async (ip: string) => `huella-de-${ip}`),
  siteUrl: SITE,
  allowedOrigins: [SITE],
  ...overrides,
})

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://proyecto.supabase.co/functions/v1/contact-publisher', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: SITE, 'cf-connecting-ip': '200.1.2.3', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('parseContactRequest', () => {
  it('acepta los datos del formulario y deja el nombre sin espacios sobrantes', () => {
    // Arrange
    const body = { ...CONTACT, fullName: '  Ana   Mejía ' }

    // Act
    const parsed = parseContactRequest(body)

    // Assert
    expect(parsed).toEqual({ ok: true, value: CONTACT })
  })

  it.each([
    ['propertyId', { propertyId: 'casa-de-ejemplo' }],
    ['fullName', { fullName: 'Ana' }],
    ['fullName', { fullName: `Ana ${'a'.repeat(120)}` }],
    ['email', { email: 'ana@' }],
    ['phone', { phone: '99998888' }],
    ['phone', { phone: '+50419998888' }],
    ['operationKey', { operationKey: '../otra' }],
    ['captchaToken', { captchaToken: 42 }],
  ])('rechaza un %s que no es válido', (field, change) => {
    // Arrange
    const body = { ...CONTACT, ...change }

    // Act
    const parsed = parseContactRequest(body)

    // Assert
    expect(parsed).toEqual({ ok: false, field })
  })
})

describe('escapeHtml', () => {
  it('convierte en texto lo que podría ser una etiqueta', () => {
    // Arrange
    const typed = '<img src=x onerror="alert(1)"> & \'hola\''

    // Act
    const escaped = escapeHtml(typed)

    // Assert
    expect(escaped).not.toMatch(/[<>"']/)
    expect(escaped).toBe('&#60;img src=x onerror=&#34;alert(1)&#34;&#62; &#38; &#39;hola&#39;')
  })
})

describe('clientIp', () => {
  it('prefiere la IP que pone Cloudflare y, si no, la primera de la cadena', () => {
    // Arrange
    const withCloudflare = new Headers({ 'cf-connecting-ip': '200.1.2.3', 'x-forwarded-for': '1.1.1.1' })
    const withChain = new Headers({ 'x-forwarded-for': '190.4.5.6, 10.0.0.1' })

    // Act
    const ips = [clientIp(withCloudflare), clientIp(withChain), clientIp(new Headers())]

    // Assert
    expect(ips).toEqual(['200.1.2.3', '190.4.5.6', null])
  })
})

describe('buildPublisherEmail', () => {
  it('va al publicador, se responde a quien escribió y lleva sus datos y el enlace al anuncio', () => {
    // Arrange
    const contact = { ...CONTACT, fullName: 'Ana <b>Mejía</b>' }

    // Act
    const email = buildPublisherEmail(contact, CLAIMED as Extract<Claim, { outcome: 'claimed' }>, SITE)

    // Assert
    expect(email).toMatchObject({
      to: 'publicador@ejemplo.hn',
      replyTo: 'ana@ejemplo.hn',
      subject: 'Nuevo interesado en tu anuncio «Casa amplia con patio en Palmira»',
    })
    expect(email.text).toContain('Teléfono: +504 9999-8888')
    expect(email.text).toContain(`Ver el anuncio: ${SITE}/propiedad/${PROPERTY_ID}`)
    expect(email.html).toContain('Ana &#60;b&#62;Mejía&#60;/b&#62;')
    expect(email.html).not.toContain('<b>Mejía</b>')
    expect(email.html).toContain('https://wa.me/50499998888')
  })
})

describe('handleContact', () => {
  it('reserva el envío con la huella de la IP, manda el correo y responde que salió', async () => {
    // Arrange
    const dependencies = deps()

    // Act
    const response = await handleContact(post(CONTACT), dependencies)

    // Assert
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ sent: true })
    expect(dependencies.claim).toHaveBeenCalledExactlyOnceWith(PROPERTY_ID, 'clave-del-envio', 'huella-de-200.1.2.3')
    expect(dependencies.sendEmail).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ to: 'publicador@ejemplo.hn', replyTo: 'ana@ejemplo.hn' }),
    )
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(SITE)
  })

  it('un reintento de un envío que ya salió no manda otro correo', async () => {
    // Arrange
    const dependencies = deps({ claim: vi.fn(async (): Promise<Claim> => ({ outcome: 'already_sent' })) })

    // Act
    const response = await handleContact(post(CONTACT), dependencies)

    // Assert
    expect(response.status).toBe(200)
    expect(dependencies.sendEmail).not.toHaveBeenCalled()
  })

  it('si el correo no sale, libera la reserva para que el reintento lo envíe, y no lo da por enviado', async () => {
    // Arrange
    const dependencies = deps({ sendEmail: vi.fn(async () => Promise.reject(new Error('Resend respondió 500.'))) })

    // Act
    const response = await handleContact(post(CONTACT), dependencies)

    // Assert
    expect(response.status).toBe(502)
    expect(dependencies.release).toHaveBeenCalledExactlyOnceWith('clave-del-envio')
  })

  it.each([
    ['RZ002', 400, 'invalid'],
    ['RZ003', 404, 'not_found'],
    ['RZ004', 429, 'too_many_contacts'],
    ['XX000', 500, 'unexpected'],
  ])('si la base responde %s, contesta %i sin enviar nada', async (code, status, error) => {
    // Arrange
    const dependencies = deps({ claim: vi.fn(async () => Promise.reject({ code })) })

    // Act
    const response = await handleContact(post(CONTACT), dependencies)

    // Assert
    expect(response.status).toBe(status)
    await expect(response.json()).resolves.toEqual({ error })
    expect(dependencies.sendEmail).not.toHaveBeenCalled()
  })

  it('con datos que no son válidos responde 400 sin tocar la base de datos', async () => {
    // Arrange
    const dependencies = deps()

    // Act
    const response = await handleContact(post({ ...CONTACT, email: 'no-es-un-correo' }), dependencies)

    // Assert
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'invalid', field: 'email' })
    expect(dependencies.claim).not.toHaveBeenCalled()
  })

  it('con un cuerpo que no es JSON responde 400', async () => {
    // Arrange
    const dependencies = deps()

    // Act
    const response = await handleContact(post('esto no es json'), dependencies)

    // Assert
    expect(response.status).toBe(400)
  })

  it('si el sitio exige la verificación contra bots, sin token o con uno rechazado responde 403 sin enviar nada', async () => {
    // Arrange
    const verifyCaptcha = vi.fn(async (token: string) => token === 'token-bueno')
    const dependencies = deps({ verifyCaptcha })

    // Act
    const missing = await handleContact(post(CONTACT), dependencies)
    const rejected = await handleContact(post({ ...CONTACT, captchaToken: 'token-malo' }), dependencies)
    const passed = await handleContact(post({ ...CONTACT, captchaToken: 'token-bueno' }), dependencies)

    // Assert
    expect([missing.status, rejected.status, passed.status]).toEqual([403, 403, 200])
    expect(verifyCaptcha).toHaveBeenCalledWith('token-malo', '200.1.2.3')
    expect(dependencies.sendEmail).toHaveBeenCalledOnce()
  })

  it('responde a la consulta previa del navegador y no autoriza a otros sitios', async () => {
    // Arrange
    const preflight = (origin: string) =>
      new Request('https://proyecto.supabase.co/functions/v1/contact-publisher', { method: 'OPTIONS', headers: { Origin: origin } })

    // Act
    const own = await handleContact(preflight(SITE), deps())
    const foreign = await handleContact(preflight('https://otro-sitio.example'), deps())

    // Assert
    expect(own.status).toBe(204)
    expect(own.headers.get('Access-Control-Allow-Origin')).toBe(SITE)
    expect(foreign.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('desde un sitio que no está autorizado no envía nada y deja el motivo en los registros', async () => {
    // Arrange
    const dependencies = deps()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    const response = await handleContact(post(CONTACT, { Origin: 'https://www.domusraiz.hn' }), dependencies)

    // Assert
    expect(response.status).toBe(403)
    expect(dependencies.claim).not.toHaveBeenCalled()
    expect(dependencies.sendEmail).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('https://www.domusraiz.hn'))
    warn.mockRestore()
  })

  it('admite las cabeceras que manda supabase-js', async () => {
    // Arrange
    const request = new Request('https://proyecto.supabase.co/functions/v1/contact-publisher', {
      method: 'OPTIONS',
      headers: { Origin: SITE },
    })

    // Act
    const response = await handleContact(request, deps())

    // Assert
    const allowed = response.headers.get('Access-Control-Allow-Headers')?.split(', ')
    expect(allowed).toEqual(expect.arrayContaining(['authorization', 'x-client-info', 'apikey', 'content-type', 'traceparent']))
  })

  it('solo admite POST', async () => {
    // Arrange
    const request = new Request('https://proyecto.supabase.co/functions/v1/contact-publisher', { method: 'GET' })

    // Act
    const response = await handleContact(request, deps())

    // Assert
    expect(response.status).toBe(405)
  })
})

describe('contacto por un proyecto', () => {
  it('acepta un proyecto con su modelo, y sin modelo también', () => {
    // Arrange
    const { model: _model, ...withoutModel } = PROJECT_CONTACT

    // Act
    const withModel = parseContactRequest({ ...PROJECT_CONTACT, model: '  Modelo   A ' })
    const plain = parseContactRequest(withoutModel)

    // Assert
    expect(withModel).toEqual({ ok: true, value: PROJECT_CONTACT })
    expect(plain).toEqual({ ok: true, value: withoutModel })
  })

  it.each([
    ['projectId', { projectId: 'torre-de-ejemplo' }],
    ['projectId', { propertyId: PROPERTY_ID }],
    ['model', { model: 'M'.repeat(61) }],
    ['model', { model: 7 }],
  ])('rechaza un %s que no es válido, y un contacto por un anuncio y un proyecto a la vez', (field, change) => {
    // Arrange
    const body = { ...PROJECT_CONTACT, ...change }

    // Act
    const parsed = parseContactRequest(body)

    // Assert
    expect(parsed).toEqual({ ok: false, field })
  })

  it('un anuncio no lleva modelo', () => {
    // Arrange
    const body = { ...CONTACT, model: 'Modelo A' }

    // Act
    const parsed = parseContactRequest(body)

    // Assert
    expect(parsed).toEqual({ ok: false, field: 'model' })
  })

  it('reserva el envío del proyecto y manda a la inmobiliaria la cotización con el modelo y el enlace al proyecto', async () => {
    // Arrange
    const dependencies = deps()

    // Act
    const response = await handleContact(post(PROJECT_CONTACT), dependencies)

    // Assert
    expect(response.status).toBe(200)
    expect(dependencies.claimProject).toHaveBeenCalledExactlyOnceWith(PROJECT_ID, 'clave-del-envio', 'huella-de-200.1.2.3')
    expect(dependencies.claim).not.toHaveBeenCalled()
    const [email] = vi.mocked(dependencies.sendEmail).mock.calls[0]
    expect(email).toMatchObject({
      to: 'ventas@constructora.hn',
      replyTo: 'ana@ejemplo.hn',
      subject: 'Nueva solicitud de cotización del Modelo A en «Torre Vista Lomas»',
    })
    expect(email.text).toContain('Modelo que le interesa: Modelo A')
    expect(email.text).toContain(`Ver el proyecto: ${SITE}/proyectos/${PROJECT_ID}`)
    expect(email.html).toContain('<strong>Modelo A</strong>')
  })

  it('el modelo que escribió quien visita va como texto en el correo, nunca como etiquetas', () => {
    // Arrange
    const contact = { ...PROJECT_CONTACT, model: '<b>Modelo</b>' }

    // Act
    const email = buildPublisherEmail(contact, PROJECT_CLAIMED as Extract<Claim, { outcome: 'claimed' }>, SITE)

    // Assert
    expect(email.html).not.toContain('<b>Modelo</b>')
    expect(email.html).toContain('&#60;b&#62;Modelo&#60;/b&#62;')
  })
})
