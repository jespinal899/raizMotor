import type { AgencyKind } from '@/features/agencies/types/agency.types'
import { honduranPhone } from '@/shared/utils/honduranPhone'
import { normalizeText } from '@/shared/utils/text'
import { email, maxLength, minLength, optional, required, validate } from '@/shared/utils/validators'
import type { FieldErrors, Validator } from '@/shared/utils/validators'

/** Los mismos topes que exige la tabla `agencies` (supabase/migrations/20261029000000_inmobiliarias.sql). */
export const MAX_AGENCY_NAME_LENGTH = 100
export const MAX_AGENCY_DESCRIPTION_LENGTH = 1000
export const MAX_SLUG_LENGTH = 60
const MIN_SLUG_LENGTH = 3
const MAX_LINK_LENGTH = 200
const MAX_CITY_LENGTH = 100
/** Lo que pesa como mucho el logo que se elige; después se reduce a unos pocos KB antes de subirlo. */
export const MAX_LOGO_BYTES = 5 * 1024 * 1024
export const LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Lo que se escribe en el formulario de «Mi inmobiliaria»: el teléfono, sin el prefijo del país. */
export interface AgencyFormValues {
  kind: AgencyKind
  name: string
  slug: string
  description: string
  city: string
  phone: string
  email: string
  website: string
  facebook: string
  instagram: string
}

/** La dirección del sitio que sale de un nombre: «Casa Norte Bienes Raíces» → «casa-norte-bienes-raices». */
export const toSlug = (name: string) =>
  normalizeText(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '')

/**
 * Un enlace como lo guarda la base: siempre con https. Quien escribe «www.casanorte.hn» o «facebook.com/casanorte»
 * no tiene por qué saber poner el protocolo.
 */
export const toLink = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return ''

  return /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^http:/i, 'https:') : `https://${trimmed}`
}

const link: Validator = (value) => {
  const normalized = toLink(value)
  if (normalized.length > MAX_LINK_LENGTH) return `El enlace no puede pasar de ${MAX_LINK_LENGTH} caracteres.`

  try {
    const url = new URL(normalized)

    return url.hostname.includes('.') ? undefined : 'Revisa el enlace: debe ser como www.tusitio.com.'
  } catch {
    return 'Revisa el enlace: debe ser como www.tusitio.com.'
  }
}

const slug: Validator = (value) =>
  SLUG_PATTERN.test(value) ? undefined : 'Usa solo minúsculas, números y guiones, sin espacios ni tildes.'

/** Lo que se exige al perfil de una inmobiliaria. Lo mismo que vuelve a comprobar la base de datos. */
export const validateAgency = (values: AgencyFormValues): FieldErrors<AgencyFormValues> => ({
  name: validate(values.name, [
    required('Escribe el nombre de tu inmobiliaria.'),
    minLength(2, 'El nombre debe tener al menos 2 caracteres.'),
    maxLength(MAX_AGENCY_NAME_LENGTH, `El nombre no puede pasar de ${MAX_AGENCY_NAME_LENGTH} caracteres.`),
  ]),
  slug: validate(values.slug, [
    required('Elige la dirección de tu página.'),
    minLength(MIN_SLUG_LENGTH, `La dirección debe tener al menos ${MIN_SLUG_LENGTH} caracteres.`),
    maxLength(MAX_SLUG_LENGTH, `La dirección no puede pasar de ${MAX_SLUG_LENGTH} caracteres.`),
    slug,
  ]),
  description: validate(values.description, [
    maxLength(MAX_AGENCY_DESCRIPTION_LENGTH, `La descripción no puede pasar de ${MAX_AGENCY_DESCRIPTION_LENGTH} caracteres.`),
  ]),
  city: validate(values.city, [maxLength(MAX_CITY_LENGTH, `La ciudad no puede pasar de ${MAX_CITY_LENGTH} caracteres.`)]),
  phone: validate(values.phone, [optional(honduranPhone)]),
  email: validate(values.email, [optional(email('Revisa el correo: debe tener el formato nombre@dominio.com.'))]),
  website: validate(values.website, [optional(link)]),
  facebook: validate(values.facebook, [optional(link)]),
  instagram: validate(values.instagram, [optional(link)]),
})

/** Si el archivo sirve como logo; el motivo si no. */
export const checkLogo = (file: File): string | undefined => {
  if (!LOGO_TYPES.includes(file.type)) return 'El logo debe ser una imagen JPG, PNG o WebP.'
  if (file.size > MAX_LOGO_BYTES) return 'El logo no puede pesar más de 5 MB.'

  return undefined
}
