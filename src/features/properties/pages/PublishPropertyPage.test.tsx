import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublishPropertyPage from '@/features/properties/pages/PublishPropertyPage'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import { publicationService } from '@/features/properties/services/publicationService'
import { BRAND } from '@/shared/constants/brand'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { FILLED_PUBLICATION, fillLocationScreen, fillPublicationForm } from '@/test/publicationForm'
import { renderWithRouter } from '@/test/renderWithRouter'
import { anyOperationKey } from '@/test/operationKey'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))
vi.mock('@/features/properties/services/geocodingService', () => ({
  geocodingService: { locate: vi.fn(async () => undefined) },
}))
vi.mock('@/features/properties/services/publicationService', () => ({
  publicationService: { publish: vi.fn(), listPublished: vi.fn(), getLimit: vi.fn() },
}))

/** Si los anuncios se guardan para todos (con Supabase) o solo en este navegador: cada prueba lo elige. */
const ads = vi.hoisted(() => ({ shared: false }))

vi.mock('@/features/properties/services/propertyRepository', () => ({
  get ADS_SHARED() {
    return ads.shared
  },
}))

const publish = vi.mocked(publicationService.publish)
const listPublished = vi.mocked(publicationService.listPublished)
const getLimit = vi.mocked(publicationService.getLimit)

const FORM_NAME = 'Formulario para publicar una propiedad'
const LIMIT_TITLE = 'Ya usaste tu publicación gratuita'

const setup = () => {
  const fakeMap = buildFakeLocationMap()
  vi.mocked(createLeafletLocationMap).mockImplementation(fakeMap.createMap)
  const view = renderWithRouter(<PublishPropertyPage />, { route: '/publicar', path: '/publicar' })

  return { fakeMap, user: userEvent.setup(), view }
}

/** El formulario aparece cuando ya se comprobó que la publicación gratuita sigue disponible. */
const setupWithForm = async () => {
  const context = setup()
  await screen.findByRole('form', { name: FORM_NAME })

  return context
}

const publishButton = () => screen.getByRole('button', { name: 'Publicar propiedad' })

// Recorrer los tres pasos lleva muchas interacciones: se da más margen que el de una prueba normal.
describe('PublishPropertyPage', { timeout: 20_000 }, () => {
  beforeEach(() => {
    ads.shared = false
    publish.mockReset()
    listPublished.mockReset()
    listPublished.mockResolvedValue([])
    getLimit.mockReset()
    getLimit.mockResolvedValue(1)
  })

  it('muestra el título, el formulario y pone su título en la pestaña', async () => {
    // Arrange: visitante que quiere anunciar

    // Act
    setup()

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Publica tu propiedad' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: FORM_NAME })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(`Publicar propiedad | ${BRAND.name}`))
  })

  it('avisa antes de empezar de que el anuncio se guardará solo en este navegador', async () => {
    // Arrange: visitante que quiere anunciar

    // Act
    setup()

    // Assert
    const note = await screen.findByRole('note')
    expect(note).toHaveTextContent('Tu anuncio se guardará solo en este navegador')
    expect(note).toHaveTextContent('otras personas no podrán verlo')
  })

  it('con los anuncios compartidos avisa antes de empezar de que será público y de qué se verá', async () => {
    // Arrange
    ads.shared = true

    // Act
    setup()

    // Assert
    const note = await screen.findByRole('note')
    expect(note).toHaveTextContent('Tu anuncio será público')
    expect(note).toHaveTextContent('la dirección y el punto del mapa')
    expect(note).toHaveTextContent('escribirte por WhatsApp al teléfono de tu cuenta')
  })

  it('al confirmar la ubicación muestra un aviso de que se guardó', async () => {
    // Arrange
    const { fakeMap, user } = await setupWithForm()

    // Act
    await fillLocationScreen(user, fakeMap)

    // Assert
    expect(await screen.findByText('Ubicación guardada con éxito.')).toBeInTheDocument()
  })

  it('guarda el anuncio completo y abre la ficha que devolvió el servicio', async () => {
    // Arrange
    publish.mockResolvedValue('anuncio-publicado')
    const { fakeMap, user, view } = await setupWithForm()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(publish).toHaveBeenCalledExactlyOnceWith(FILLED_PUBLICATION, anyOperationKey())
    await waitFor(() => expect(view.currentPath()).toBe('/propiedad/anuncio-publicado'))
  })

  it('si falla el almacenamiento, avisa sin navegar ni confirmar el anuncio', async () => {
    // Arrange
    publish.mockRejectedValue(new Error('almacenamiento no disponible'))
    const { fakeMap, user } = await setupWithForm()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar tu propiedad')
  })

  it('si al publicar el servicio dice que la publicación gratuita ya se usó, lo avisa sin navegar', async () => {
    // Arrange
    publish.mockRejectedValue(new PublicationLimitError())
    const { fakeMap, user, view } = await setupWithForm()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(LIMIT_TITLE)
    expect(view.currentPath()).toBe('/publicar')
  })
})

describe('PublishPropertyPage: una sola publicación gratuita', () => {
  beforeEach(() => {
    ads.shared = false
    listPublished.mockReset()
    getLimit.mockReset()
    getLimit.mockResolvedValue(1)
  })

  it('mientras comprueba si la publicación gratuita sigue disponible muestra un marcador de carga', () => {
    // Arrange
    listPublished.mockReturnValue(new Promise<string[]>(() => {}))

    // Act
    setup()

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: FORM_NAME })).not.toBeInTheDocument()
  })

  it('si este navegador ya tiene un anuncio, avisa de que la publicación gratuita ya se usó en lugar del formulario', async () => {
    // Arrange
    listPublished.mockResolvedValue(['mi-anuncio'])

    // Act
    setup()

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: LIMIT_TITLE })).toBeInTheDocument()
    expect(screen.getByText(/El plan Propietario incluye una sola publicación/)).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: FORM_NAME })).not.toBeInTheDocument()
  })

  it('desde ese aviso se puede ir a los anuncios propios, para eliminar alguno, o volver a los planes', async () => {
    // Arrange
    listPublished.mockResolvedValue(['el-mas-reciente', 'uno-anterior'])

    // Act
    setup()

    // Assert
    expect(await screen.findByRole('link', { name: 'Ver mis anuncios' })).toHaveAttribute('href', '/mis-anuncios')
    expect(screen.getByRole('link', { name: 'Ver los planes' })).toHaveAttribute('href', '/planes')
  })

  it('con los anuncios compartidos dice que la publicación gratuita ya la tiene su cuenta, no el navegador', async () => {
    // Arrange
    ads.shared = true
    listPublished.mockResolvedValue(['mi-anuncio'])

    // Act
    setup()

    // Assert
    expect(await screen.findByText(/tu cuenta ya tiene una/)).toBeInTheDocument()
  })

  it('con un plan de varios anuncios deja publicar mientras queden', async () => {
    // Arrange
    getLimit.mockResolvedValue(3)
    listPublished.mockResolvedValue(['uno', 'otro'])

    // Act
    setup()

    // Assert
    expect(await screen.findByRole('form', { name: FORM_NAME })).toBeInTheDocument()
  })

  it('con un plan de varios anuncios, al usarlos todos dice cuántos incluye en lugar del formulario', async () => {
    // Arrange
    getLimit.mockResolvedValue(2)
    listPublished.mockResolvedValue(['uno', 'otro'])

    // Act
    setup()

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Ya usaste los anuncios de tu plan' })).toBeInTheDocument()
    expect(screen.getByText(/Tu plan incluye 2 anuncios a la vez/)).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: FORM_NAME })).not.toBeInTheDocument()
  })

  it('si no se puede leer lo guardado en el navegador muestra el formulario: el fallo se avisa al publicar', async () => {
    // Arrange
    listPublished.mockRejectedValue(new Error('Este navegador no permite guardar publicaciones.'))

    // Act
    setup()

    // Assert
    expect(await screen.findByRole('form', { name: FORM_NAME })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: LIMIT_TITLE })).not.toBeInTheDocument()
  })
})
