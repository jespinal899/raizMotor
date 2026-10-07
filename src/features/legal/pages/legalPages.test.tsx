import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PrivacyPage from '@/features/legal/pages/PrivacyPage'
import TermsPage from '@/features/legal/pages/TermsPage'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'
import { EXCHANGE_RATE } from '@/shared/constants/currency'
import { renderWithRouter } from '@/test/renderWithRouter'

const sectionTitles = () => screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
const main = () => document.body.textContent ?? ''

describe('TermsPage', () => {
  it('presenta los términos y condiciones con sus secciones', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<TermsPage />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Términos y condiciones' })).toBeInTheDocument()
    expect(sectionTitles()).toEqual([
      `1. Qué es ${BRAND.name}`,
      '2. El sitio está en desarrollo',
      '3. Publicar un anuncio',
      '4. Precios y moneda',
      '5. Cotizaciones y contacto',
      '6. Tu seguridad',
      '7. Responsabilidad',
      '8. Cambios en estos términos',
      '9. Contacto',
    ])
  })

  it('pone el título de la página en la pestaña', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<TermsPage />)

    // Assert
    expect(document.title).toBe(`Términos y condiciones | ${BRAND.name}`)
  })

  it('dice con qué tipo de cambio se calculan los lempiras y que el importe es orientativo', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<TermsPage />)

    // Assert
    expect(main()).toContain(`L ${EXCHANGE_RATE.lempirasPerDollar} por $ 1`)
    expect(main()).toContain('Ese importe es orientativo')
  })

  it('no esconde que hoy los anuncios de ejemplo no son reales ni que los envíos no están activos', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<TermsPage />)

    // Assert
    expect(main()).toContain('no corresponden a propiedades reales')
    expect(main()).toContain('todavía no se envían a ningún servidor')
  })

  it('da el teléfono de contacto y enlaza con la política de privacidad', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<TermsPage />)

    // Assert
    expect(main()).toContain(CONTACT.phone.display)
    expect(screen.getByRole('link', { name: 'Leer la política de privacidad' })).toHaveAttribute('href', '/privacidad')
  })
})

describe('PrivacyPage', () => {
  it('presenta la política de privacidad con sus secciones', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<PrivacyPage />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeInTheDocument()
    expect(sectionTitles()).toEqual([
      '1. Qué datos tratamos hoy',
      '2. Servicios de terceros',
      '3. Cookies',
      '4. Cómo borrar tus datos',
      '5. Cuando el servicio esté completo',
      '6. Contacto',
    ])
  })

  it('nombra los servicios de terceros que cargan contenido en el sitio', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<PrivacyPage />)

    // Assert
    for (const service of ['GitHub Pages', 'OpenStreetMap', 'Unsplash', 'Google Maps', 'WhatsApp']) {
      expect(main()).toContain(service)
    }
  })

  it('aclara que al buscar una dirección nunca se envían la calle ni el número', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<PrivacyPage />)

    // Assert
    expect(main()).toContain('nunca la calle ni el número de la casa')
  })

  it('enlaza con los términos y condiciones', () => {
    // Arrange: página sin estado previo

    // Act
    renderWithRouter(<PrivacyPage />)

    // Assert
    expect(screen.getByRole('link', { name: 'Leer los términos y condiciones' })).toHaveAttribute('href', '/terminos')
  })
})
