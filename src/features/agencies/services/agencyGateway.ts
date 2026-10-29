import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgencyKind } from '@/features/agencies/types/agency.types'

/** Una inmobiliaria tal como está en la tabla `agencies`. Lo que no llenó es una cadena vacía. */
export interface AgencyRow {
  owner_id: string
  slug: string
  kind: AgencyKind
  name: string
  description: string
  /** Ruta dentro del depósito `agency-logos`; `null` si no subió uno. */
  logo: string | null
  phone: string
  email: string
  website: string
  facebook: string
  instagram: string
  city: string
  verified: boolean
}

/** Lo que el sitio escribe de una inmobiliaria. La verificación y las fechas las fija la base de datos. */
export type AgencyChanges = Omit<AgencyRow, 'verified'>

/** Lo que el servicio de inmobiliarias necesita de Supabase, sin su manera de escribir las consultas. */
export interface AgencyGateway {
  /** Identificador de la cuenta con la sesión abierta; `null` si no hay ninguna. */
  currentUserId(): Promise<string | null>
  /** Si el plan de la cuenta admite proyectos, que es lo que hace falta para tener inmobiliaria. */
  hasAgencyPlan(ownerId: string): Promise<boolean>
  findByOwner(ownerId: string): Promise<AgencyRow | undefined>
  findBySlug(slug: string): Promise<AgencyRow | undefined>
  /** Las de esas cuentas que se pueden ver; las demás no vienen. */
  listByOwners(ownerIds: string[]): Promise<AgencyRow[]>
  /** Crea la inmobiliaria de la cuenta o guarda sus cambios. Rechaza con el fallo de la base. */
  save(row: AgencyChanges): Promise<void>
  uploadLogo(path: string, logo: Blob): Promise<void>
  removeLogos(paths: string[]): Promise<void>
  /** Dirección pública de un logo guardado. */
  logoUrl(path: string): string
}

const AGENCIES = 'agencies'
const LOGOS = 'agency-logos'
/** Un logo no cambia de contenido en su ruta (cada uno nuevo lleva otra): el navegador puede guardarlo un año. */
const LOGO_CACHE_SECONDS = '31536000'

const unwrap = <Data>({ data, error }: { data: Data; error: Error | null }): Data => {
  if (error) throw error

  return data
}

/**
 * Las consultas a Supabase de las inmobiliarias, y nada más. La tabla y el depósito los crea
 * supabase/migrations/20261029000000_inmobiliarias.sql.
 */
export const createSupabaseAgencyGateway = (client: SupabaseClient): AgencyGateway => {
  const agencies = () => client.from(AGENCIES)
  const logos = () => client.storage.from(LOGOS)

  return {
    currentUserId: async () => (await client.auth.getSession()).data.session?.user.id ?? null,

    hasAgencyPlan: async (ownerId) =>
      (unwrap<{ max_projects: number }[] | null>(
        await client.from('profiles').select('max_projects').eq('id', ownerId).limit(1),
      )?.[0]?.max_projects ?? 0) > 0,

    findByOwner: async (ownerId) =>
      unwrap<AgencyRow[] | null>(await agencies().select('*').eq('owner_id', ownerId).limit(1))?.[0],

    findBySlug: async (slug) => unwrap<AgencyRow[] | null>(await agencies().select('*').eq('slug', slug).limit(1))?.[0],

    listByOwners: async (ownerIds) =>
      ownerIds.length === 0 ? [] : (unwrap<AgencyRow[] | null>(await agencies().select('*').in('owner_id', ownerIds)) ?? []),

    save: async (row) => {
      unwrap(await agencies().upsert(row, { onConflict: 'owner_id' }))
    },

    uploadLogo: async (path, logo) => {
      unwrap(await logos().upload(path, logo, { upsert: true, contentType: logo.type, cacheControl: LOGO_CACHE_SECONDS }))
    },

    removeLogos: async (paths) => {
      if (paths.length > 0) unwrap(await logos().remove(paths))
    },

    logoUrl: (path) => logos().getPublicUrl(path).data.publicUrl,
  }
}
