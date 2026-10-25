import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContactPage from '@/features/contact/pages/ContactPage'
import { propertyService } from '@/features/properties/services/propertyService'
import { BRAND } from '@/shared/constants/brand'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/propertyService', () => ({
  propertyService: { getFeatured: vi.fn(), search: vi.fn(), getById: vi.fn() },
}))

const getById = vi.mocked(propertyService.getById)

const renderPage = (route = '/contacto') => renderWithRouter(<ContactPage />, { route, path: '/contacto' })

/** El texto con que se abre el chat de WhatsApp. */
const chatText = async () => {
  const link = await screen.findByRole('link', { name: 'Abrir WhatsApp' })
  return new URL(link.getAttribute('href') ?? '').searchParams.get('text')
}

describe('ContactPage', () => {
  beforeEach(() => {
    getById.mockReset()
  })

  it('muestra el título, el chat de WhatsApp y las otras formas de contacto, sin un formulario que no se envía', async () => {
    // Arrange: consulta general

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Contáctenos' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Abrir WhatsApp' })).toHaveAttribute('target', '_blank')
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Otras formas de contacto' })).toBeInTheDocument()
    expect(document.title).toBe(`Contáctenos | ${BRAND.name}`)
  })

  it('en una consulta general el chat abre con un saludo', async () => {
    // Arrange: consulta general

    // Act
    renderPage()

    // Assert
    expect(await chatText()).toBe(`Hola, tengo una consulta sobre ${BRAND.name}.`)
  })

  it('al llegar desde una propiedad la muestra y el chat abre con la consulta y su enlace', async () => {
    // Arrange
    getById.mockResolvedValue(buildProperty({ id: 'casa-1', title: 'Casa con jardín', district: 'Barranco', city: 'Lima' }))

    // Act
    renderPage('/contacto?propiedad=casa-1')

    // Assert
    expect(await chatText()).toBe(
      `Me interesa la propiedad "Casa con jardín" en Barranco, Lima. ¿Sigue disponible?\n${window.location.origin}/propiedad/casa-1`,
    )
    expect(screen.getByText('Consulta sobre la propiedad')).toBeInTheDocument()
  })

  it('mientras carga la propiedad muestra un marcador en lugar del chat', () => {
    // Arrange
    getById.mockReturnValue(new Promise(() => {}))

    // Act
    renderPage('/contacto?propiedad=casa-1')

    // Assert
    expect(screen.getByLabelText('Cargando consulta')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('link', { name: 'Abrir WhatsApp' })).not.toBeInTheDocument()
  })

  it('al llegar desde un plan lo muestra y el chat abre con la consulta', async () => {
    // Arrange
    const route = '/contacto?plan=inmobiliaria'

    // Act
    renderPage(route)

    // Assert
    expect(await chatText()).toBe('Me interesa el plan Inmobiliarias. ¿Me pueden dar más información?')
    expect(screen.getByText('Consulta sobre el plan')).toBeInTheDocument()
    expect(getById).not.toHaveBeenCalled()
  })

  it('si la propiedad de la URL no existe, queda como consulta general', async () => {
    // Arrange
    getById.mockResolvedValue(undefined)

    // Act
    renderPage('/contacto?propiedad=no-existe')

    // Assert
    expect(await chatText()).toBe(`Hola, tengo una consulta sobre ${BRAND.name}.`)
    expect(screen.queryByText('Consulta sobre la propiedad')).not.toBeInTheDocument()
  })
})
