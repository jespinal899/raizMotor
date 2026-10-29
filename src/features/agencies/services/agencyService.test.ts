import { describe, expect, it, vi } from 'vitest'
import { AgencyPlanRequiredError, AgencySlugTakenError } from '@/features/agencies/services/agencyErrors'
import type { AgencyGateway, AgencyRow } from '@/features/agencies/services/agencyGateway'
import { createAgencyService } from '@/features/agencies/services/agencyService'
import type { AgencyProfile } from '@/features/agencies/types/agency.types'
import { PublicationSignInRequiredError } from '@/features/properties/services/publicationErrors'

const OWNER = 'cuenta-casa-norte'
const PREPARED = new Blob(['logo reducido'], { type: 'image/webp' })

const row = (overrides: Partial<AgencyRow> = {}): AgencyRow => ({
  owner_id: OWNER,
  slug: 'casa-norte',
  kind: 'inmobiliaria',
  name: 'Casa Norte',
  description: 'Casas en San Pedro Sula.',
  logo: `${OWNER}/logo-1.webp`,
  phone: '+50499999999',
  email: '',
  website: 'https://casanorte.hn',
  facebook: '',
  instagram: '',
  city: 'San Pedro Sula',
  verified: true,
  ...overrides,
})

const PROFILE: AgencyProfile = {
  slug: 'casa-norte',
  name: 'Casa Norte',
  kind: 'inmobiliaria',
  description: 'Casas en San Pedro Sula.',
  city: 'San Pedro Sula',
  phone: '+50499999999',
  email: '',
  website: 'https://casanorte.hn',
  facebook: '',
  instagram: '',
}

interface Database {
  userId?: string | null
  eligible?: boolean
  rows?: AgencyRow[]
  saveFails?: unknown
}

const setup = ({ userId = OWNER, eligible = true, rows = [], saveFails }: Database = {}) => {
  const stored = [...rows]
  const gateway: AgencyGateway = {
    currentUserId: vi.fn(async () => userId),
    hasAgencyPlan: vi.fn(async () => eligible),
    findByOwner: vi.fn(async (owner) => stored.find((saved) => saved.owner_id === owner)),
    findBySlug: vi.fn(async (slug) => stored.find((saved) => saved.slug === slug)),
    listByOwners: vi.fn(async (owners) => stored.filter((saved) => owners.includes(saved.owner_id))),
    save: vi.fn(async (changes) => {
      if (saveFails) throw saveFails
      const index = stored.findIndex((saved) => saved.owner_id === changes.owner_id)
      const saved = { ...changes, verified: index >= 0 ? stored[index].verified : false }
      if (index >= 0) stored[index] = saved
      else stored.push(saved)
    }),
    uploadLogo: vi.fn(async () => {}),
    removeLogos: vi.fn(async () => {}),
    logoUrl: (path) => `https://logos.example/${path}`,
  }
  const prepareLogo = vi.fn(async () => PREPARED)

  return { gateway, prepareLogo, service: createAgencyService({ gateway, prepareLogo, now: () => 2 }) }
}

describe('createAgencyService: la inmobiliaria propia', () => {
  it('dice si la cuenta puede tener inmobiliaria y cuál tiene, con los datos que no llenó sin valor', async () => {
    const { service } = setup({ rows: [row()] })

    const own = await service.getOwn()

    expect(own).toEqual({
      eligible: true,
      agency: {
        slug: 'casa-norte',
        name: 'Casa Norte',
        kind: 'inmobiliaria',
        logoUrl: `https://logos.example/${OWNER}/logo-1.webp`,
        verified: true,
        description: 'Casas en San Pedro Sula.',
        city: 'San Pedro Sula',
        phone: '+50499999999',
        website: 'https://casanorte.hn',
      },
    })
  })

  it('sin sesión no hay inmobiliaria ni derecho a tenerla', async () => {
    const { service, gateway } = setup({ userId: null })

    expect(await service.getOwn()).toEqual({ eligible: false })
    expect(gateway.hasAgencyPlan).not.toHaveBeenCalled()
  })

  it('crea el perfil con el logo nuevo, ya reducido, en la carpeta de la cuenta', async () => {
    const { service, gateway, prepareLogo } = setup()
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' })

    const saved = await service.saveOwn({ ...PROFILE, logo })

    expect(prepareLogo).toHaveBeenCalledExactlyOnceWith(logo)
    expect(gateway.uploadLogo).toHaveBeenCalledExactlyOnceWith(`${OWNER}/logo-2.webp`, PREPARED)
    expect(gateway.save).toHaveBeenCalledExactlyOnceWith({ ...PROFILE, owner_id: OWNER, logo: `${OWNER}/logo-2.webp` })
    expect(saved.logoUrl).toBe(`https://logos.example/${OWNER}/logo-2.webp`)
    expect(gateway.removeLogos).not.toHaveBeenCalled()
  })

  it('al cambiar el logo borra el anterior después de guardar; sin logo nuevo, lo conserva', async () => {
    const changed = setup({ rows: [row()] })
    const kept = setup({ rows: [row()] })

    await changed.service.saveOwn({ ...PROFILE, logo: new File(['logo'], 'logo.png', { type: 'image/png' }) })
    await kept.service.saveOwn(PROFILE)

    expect(changed.gateway.removeLogos).toHaveBeenCalledExactlyOnceWith([`${OWNER}/logo-1.webp`])
    expect(kept.gateway.save).toHaveBeenCalledWith(expect.objectContaining({ logo: `${OWNER}/logo-1.webp` }))
    expect(kept.gateway.removeLogos).not.toHaveBeenCalled()
  })

  it('quitar el logo lo deja sin logo y borra el archivo', async () => {
    const { service, gateway } = setup({ rows: [row()] })

    const saved = await service.saveOwn({ ...PROFILE, logo: null })

    expect(saved.logoUrl).toBeUndefined()
    expect(gateway.removeLogos).toHaveBeenCalledExactlyOnceWith([`${OWNER}/logo-1.webp`])
  })

  it.each([
    { reason: { code: '23505' }, expected: AgencySlugTakenError },
    { reason: { code: 'RZ006' }, expected: AgencyPlanRequiredError },
  ])('traduce el fallo $reason.code y borra el logo que acababa de subir', async ({ reason, expected }) => {
    const { service, gateway } = setup({ saveFails: reason })

    await expect(service.saveOwn({ ...PROFILE, logo: new File(['x'], 'logo.png', { type: 'image/png' }) })).rejects.toBeInstanceOf(
      expected,
    )
    expect(gateway.removeLogos).toHaveBeenCalledExactlyOnceWith([`${OWNER}/logo-2.webp`])
  })

  it('sin sesión no guarda nada', async () => {
    const { service, gateway } = setup({ userId: null })

    await expect(service.saveOwn(PROFILE)).rejects.toBeInstanceOf(PublicationSignInRequiredError)
    expect(gateway.save).not.toHaveBeenCalled()
  })
})

describe('createAgencyService: lo público', () => {
  it('entrega la página de una inmobiliaria con la cuenta que publica a su nombre', async () => {
    const { service } = setup({ rows: [row()] })

    const page = await service.getPage('casa-norte')

    expect(page?.ownerId).toBe(OWNER)
    expect(page?.agency.name).toBe('Casa Norte')
    expect(await service.getPage('no-existe')).toBeUndefined()
  })

  it('entrega la marca de cada cuenta que tiene inmobiliaria, pidiendo cada cuenta una sola vez', async () => {
    const { service, gateway } = setup({ rows: [row({ logo: null })] })

    const brands = await service.getBrands([OWNER, 'particular', OWNER])

    expect(gateway.listByOwners).toHaveBeenCalledExactlyOnceWith([OWNER, 'particular'])
    expect([...brands.entries()]).toEqual([[OWNER, { slug: 'casa-norte', name: 'Casa Norte', kind: 'inmobiliaria', verified: true }]])
  })
})
