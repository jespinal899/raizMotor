/** Qué es la cuenta que publica: una inmobiliaria que vende, o una constructora que además construye. */
export type AgencyKind = 'inmobiliaria' | 'constructora'

/** Lo que sale de una inmobiliaria en sus anuncios y proyectos: quién es, su logo y si el equipo la verificó. */
export interface AgencyBrand {
  /** Lo que va en su dirección del sitio: /inmobiliaria/<slug>. */
  slug: string
  name: string
  kind: AgencyKind
  /** Sin valor si no subió un logo. */
  logoUrl?: string
  verified: boolean
}

/** El perfil público completo, el de su página. Lo que no llenó llega sin valor. */
export interface Agency extends AgencyBrand {
  description: string
  city?: string
  /** Completo y sin separadores (+50499999999). */
  phone?: string
  email?: string
  website?: string
  facebook?: string
  instagram?: string
}

/** Lo que la inmobiliaria escribe en «Mi inmobiliaria». Los textos van tal cual; vacío es «sin valor». */
export interface AgencyProfile {
  slug: string
  name: string
  kind: AgencyKind
  description: string
  city: string
  /** Completo y sin separadores, o vacío. */
  phone: string
  email: string
  website: string
  facebook: string
  instagram: string
  /** Un archivo es un logo nuevo; `null`, quitar el que tenía; sin valor, dejarlo como está. */
  logo?: File | null
}

/** La inmobiliaria de quien usa el sitio: si su plan admite tener una y, si ya la creó, cuál es. */
export interface OwnAgency {
  eligible: boolean
  agency?: Agency
}

/** La página de una inmobiliaria: su perfil y la cuenta que publica a su nombre. */
export interface AgencyPage {
  agency: Agency
  ownerId: string
}
