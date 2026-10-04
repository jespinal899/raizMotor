import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContactPage from '@/features/contact/pages/ContactPage'
import { contactService } from '@/features/contact/services/contactService'
import { propertyService } from '@/features/properties/services/propertyService'
import { BRAND } from '@/shared/constants/brand'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/contact/services/contactService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/contact/services/contactService')>()),
  contactService: { send: vi.fn() },
}))
vi.mock('@/features/properties/services/propertyService', () => ({
  propertyService: { getFeatured: vi.fn(), search: vi.fn(), getById: vi.fn() },
}))

const send = vi.mocked(contactService.send)
const getById = vi.mocked(propertyService.getById)

const renderPage = (route = '/contacto') => renderWithRouter(<ContactPage />, { route, path: '/contacto' })

const descriptionField = () => screen.findByRole('textbox', { name: 'Descripción' })

const fillSender = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Ana')
  await user.type(screen.getByRole('textbox', { name: 'Correo' }), 'ana@gmail.com')
}

describe('ContactPage', () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue(undefined)
    getById.mockReset()
  })

  it('muestra el título, el formulario y las otras formas de contacto', async () => {
    // Arrange: consulta general

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Contáctenos' })).toBeInTheDocument()
    expect(await screen.findByRole('form', { name: 'Formulario de contacto' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Otras formas de contacto' })).toBeInTheDocument()
    expect(document.title).toBe(`Contáctenos | ${BRAND.name}`)
  })

  it('en una consulta general la descripción empieza vacía y se envía sin referencia', async () => {
    // Arrange
    const user = userEvent.setup()
    renderPage()
    await fillSender(user)
    await user.type(await descriptionField(), 'Quiero publicar mi casa.')

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    // Assert
    expect(send).toHaveBeenCalledExactlyOnceWith({
      name: 'Ana',
      email: 'ana@gmail.com',
      phone: '',
      description: 'Quiero publicar mi casa.',
      reference: undefined,
    })
  })

  it('al llegar desde una propiedad la muestra, propone la descripción y envía su enlace', async () => {
    // Arrange
    const user = userEvent.setup()
    getById.mockResolvedValue(buildProperty({ id: 'casa-1', title: 'Casa con jardín', district: 'Barranco', city: 'Lima' }))
    renderPage('/contacto?propiedad=casa-1')
    const description = await descriptionField()
    await fillSender(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    // Assert
    expect(screen.getByText('Consulta sobre la propiedad')).toBeInTheDocument()
    expect(description).toHaveValue('Me interesa la propiedad "Casa con jardín" en Barranco, Lima. ¿Sigue disponible?')
    expect(send).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ reference: `${window.location.origin}/propiedad/casa-1` }),
    )
  })

  it('mientras carga la propiedad muestra un marcador en lugar del formulario', () => {
    // Arrange
    getById.mockReturnValue(new Promise(() => {}))

    // Act
    renderPage('/contacto?propiedad=casa-1')

    // Assert
    expect(screen.getByLabelText('Cargando formulario')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('al llegar desde un plan lo muestra y propone la descripción', async () => {
    // Arrange
    const route = '/contacto?plan=inmobiliaria'

    // Act
    renderPage(route)

    // Assert
    expect(await descriptionField()).toHaveValue('Me interesa el plan Inmobiliaria. ¿Me pueden dar más información?')
    expect(screen.getByText('Consulta sobre el plan')).toBeInTheDocument()
    expect(getById).not.toHaveBeenCalled()
  })

  it('si la propiedad de la URL no existe, queda como consulta general', async () => {
    // Arrange
    getById.mockResolvedValue(undefined)

    // Act
    renderPage('/contacto?propiedad=no-existe')

    // Assert
    expect(await descriptionField()).toHaveValue('')
    expect(screen.queryByText('Consulta sobre la propiedad')).not.toBeInTheDocument()
  })
})
