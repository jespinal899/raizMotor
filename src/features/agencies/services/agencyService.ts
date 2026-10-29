import { AgencyPlanRequiredError, AgencySlugTakenError } from '@/features/agencies/services/agencyErrors'
import { createSupabaseAgencyGateway } from '@/features/agencies/services/agencyGateway'
import type { AgencyGateway, AgencyRow } from '@/features/agencies/services/agencyGateway'
import type { Agency, AgencyBrand, AgencyPage, AgencyProfile, OwnAgency } from '@/features/agencies/types/agency.types'
import { PublicationSignInRequiredError } from '@/features/properties/services/publicationErrors'
import { photoExtension, resizePhoto } from '@/features/properties/utils/photoResize'
import { supabase } from '@/lib/supabaseClient'

/** Lado más largo con que se guarda un logo: se ve como mucho a 96 px, y así pesa unos pocos KB. */
export const MAX_LOGO_SIDE = 400

/** Código con que la base dice que la cuenta no tiene plan de inmobiliaria (supabase/migrations). */
const PLAN_REQUIRED = 'RZ006'
/** Código de Postgres para un valor que ya existe: aquí, la dirección de otra inmobiliaria. */
const UNIQUE_VIOLATION = '23505'

export interface AgencyService {
  /** La inmobiliaria de quien usa el sitio. Sin sesión, ninguna y sin derecho a tenerla. */
  getOwn(): Promise<OwnAgency>
  /** Crea o corrige la inmobiliaria de quien usa el sitio, con su logo, y la devuelve como quedó. */
  saveOwn(profile: AgencyProfile): Promise<Agency>
  /** Su página: el perfil y la cuenta que publica a su nombre; sin valor si no existe o no se puede ver. */
  getPage(slug: string): Promise<AgencyPage | undefined>
  /** La marca de cada cuenta que tiene inmobiliaria, para mostrarla en sus anuncios y proyectos. */
  getBrands(ownerIds: string[]): Promise<Map<string, AgencyBrand>>
}

const hasCode = (reason: unknown, code: string) =>
  typeof reason === 'object' && reason !== null && 'code' in reason && reason.code === code

const toFailure = (reason: unknown) => {
  if (hasCode(reason, UNIQUE_VIOLATION)) return new AgencySlugTakenError()
  if (hasCode(reason, PLAN_REQUIRED)) return new AgencyPlanRequiredError()

  return reason
}

/** Un texto vacío es un dato que la inmobiliaria no dio: no se muestra. */
const filled = <Key extends string>(key: Key, value: string) => (value ? ({ [key]: value } as Record<Key, string>) : {})

interface AgencyServiceOptions {
  gateway: AgencyGateway
  /** Deja el logo listo para subirlo: reducido, para que no pese. */
  prepareLogo: (logo: File) => Promise<Blob>
  /** Para nombrar cada logo nuevo distinto del anterior: así ningún navegador sigue mostrando el viejo. */
  now?: () => number
}

/** Las inmobiliarias guardadas en Supabase: cada cuenta con plan de inmobiliaria gestiona la suya. */
export const createAgencyService = ({ gateway, prepareLogo, now = Date.now }: AgencyServiceOptions): AgencyService => {
  const toBrand = (row: AgencyRow): AgencyBrand => ({
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    ...(row.logo && { logoUrl: gateway.logoUrl(row.logo) }),
    verified: row.verified,
  })

  const toAgency = (row: AgencyRow): Agency => ({
    ...toBrand(row),
    description: row.description,
    ...filled('city', row.city),
    ...filled('phone', row.phone),
    ...filled('email', row.email),
    ...filled('website', row.website),
    ...filled('facebook', row.facebook),
    ...filled('instagram', row.instagram),
  })

  return {
    getOwn: async () => {
      const ownerId = await gateway.currentUserId()
      if (!ownerId) return { eligible: false }

      const [eligible, row] = await Promise.all([gateway.hasAgencyPlan(ownerId), gateway.findByOwner(ownerId)])

      return { eligible, ...(row && { agency: toAgency(row) }) }
    },

    saveOwn: async ({ logo, ...profile }) => {
      const ownerId = await gateway.currentUserId()
      if (!ownerId) throw new PublicationSignInRequiredError()

      const current = await gateway.findByOwner(ownerId)
      let logoPath = current?.logo ?? null
      if (logo) {
        const prepared = await prepareLogo(logo)
        logoPath = `${ownerId}/logo-${now()}.${photoExtension(prepared.type)}`
        await gateway.uploadLogo(logoPath, prepared)
      } else if (logo === null) {
        logoPath = null
      }

      try {
        await gateway.save({ ...profile, owner_id: ownerId, logo: logoPath })
      } catch (reason) {
        // El logo nuevo no lo usa nadie si el perfil no se guardó.
        if (logo && logoPath) await gateway.removeLogos([logoPath]).catch(() => undefined)
        throw toFailure(reason)
      }

      // El anterior se borra al final: si fallara, sobraría un archivo, no faltaría el logo.
      if (current?.logo && current.logo !== logoPath) await gateway.removeLogos([current.logo]).catch(() => undefined)

      const saved = await gateway.findByOwner(ownerId)
      if (!saved) throw new Error('El perfil de la inmobiliaria no quedó guardado.')

      return toAgency(saved)
    },

    getPage: async (slug) => {
      const row = await gateway.findBySlug(slug)

      return row && { agency: toAgency(row), ownerId: row.owner_id }
    },

    getBrands: async (ownerIds) => {
      const rows = await gateway.listByOwners([...new Set(ownerIds)])

      return new Map(rows.map((row) => [row.owner_id, toBrand(row)]))
    },
  }
}

/** Sin Supabase no hay cuentas, así que tampoco inmobiliarias. */
export const createPendingAgencyService = (): AgencyService => ({
  getOwn: async () => ({ eligible: false }),
  saveOwn: async () => {
    throw new Error('Las inmobiliarias necesitan Supabase.')
  },
  getPage: async () => undefined,
  getBrands: async () => new Map(),
})

// Único punto donde se elige el servicio de las inmobiliarias.
export const agencyService: AgencyService = supabase
  ? createAgencyService({
      gateway: createSupabaseAgencyGateway(supabase),
      prepareLogo: (logo) => resizePhoto(logo, MAX_LOGO_SIDE),
    })
  : createPendingAgencyService()
