import { describe, expect, it } from 'vitest'
import { checkLogo, toLink, toSlug, validateAgency } from '@/features/agencies/utils/agencyFormRules'
import type { AgencyFormValues } from '@/features/agencies/utils/agencyFormRules'

const VALUES: AgencyFormValues = {
  kind: 'inmobiliaria',
  name: 'Casa Norte',
  slug: 'casa-norte',
  description: '',
  city: '',
  phone: '',
  email: '',
  website: '',
  facebook: '',
  instagram: '',
}

describe('toSlug', () => {
  it.each([
    ['Casa Norte Bienes Raíces', 'casa-norte-bienes-raices'],
    ['  Constructora   Ñandú & Hijos  ', 'constructora-nandu-hijos'],
    ['¡Inmobiliaria 2026!', 'inmobiliaria-2026'],
  ])('«%s» → «%s»', (name, expected) => {
    expect(toSlug(name)).toBe(expected)
  })

  it('no pasa de 60 caracteres ni termina en guion', () => {
    const slug = toSlug(`${'a'.repeat(59)} b`)

    expect(slug).toBe('a'.repeat(59))
  })
})

describe('toLink', () => {
  it.each([
    ['www.casanorte.hn', 'https://www.casanorte.hn'],
    ['http://casanorte.hn', 'https://casanorte.hn'],
    ['https://facebook.com/casanorte', 'https://facebook.com/casanorte'],
    ['   ', ''],
  ])('«%s» se guarda como «%s»', (text, expected) => {
    expect(toLink(text)).toBe(expected)
  })
})

describe('validateAgency', () => {
  it('acepta un perfil con solo nombre y dirección', () => {
    expect(Object.values(validateAgency(VALUES)).filter(Boolean)).toEqual([])
  })

  it('pide el nombre y una dirección sin espacios ni mayúsculas', () => {
    const errors = validateAgency({ ...VALUES, name: ' ', slug: 'Casa Norte' })

    expect(errors.name).toBe('Escribe el nombre de tu inmobiliaria.')
    expect(errors.slug).toBe('Usa solo minúsculas, números y guiones, sin espacios ni tildes.')
  })

  it('revisa el teléfono, el correo y los enlaces solo si se escribieron', () => {
    const errors = validateAgency({ ...VALUES, phone: '12', email: 'casa@', website: 'casanorte' })

    expect(errors.phone).toBeDefined()
    expect(errors.email).toBe('Revisa el correo: debe tener el formato nombre@dominio.com.')
    expect(errors.website).toBe('Revisa el enlace: debe ser como www.tusitio.com.')
  })
})

describe('checkLogo', () => {
  it('acepta una imagen y rechaza otro tipo de archivo o una muy pesada', () => {
    const png = new File(['x'], 'logo.png', { type: 'image/png' })
    const pdf = new File(['x'], 'logo.pdf', { type: 'application/pdf' })
    const heavy = new File([new Uint8Array(6 * 1024 * 1024)], 'logo.jpg', { type: 'image/jpeg' })

    expect(checkLogo(png)).toBeUndefined()
    expect(checkLogo(pdf)).toBe('El logo debe ser una imagen JPG, PNG o WebP.')
    expect(checkLogo(heavy)).toBe('El logo no puede pesar más de 5 MB.')
  })
})
