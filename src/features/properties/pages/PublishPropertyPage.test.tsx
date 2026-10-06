import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublishPropertyPage from '@/features/properties/pages/PublishPropertyPage'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
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
vi.mock('@/features/properties/services/publicationService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/properties/services/publicationService')>()),
  publicationService: { publish: vi.fn() },
}))

const publish = vi.mocked(publicationService.publish)

const setup = () => {
  const fakeMap = buildFakeLocationMap()
  vi.mocked(createLeafletLocationMap).mockImplementation(fakeMap.createMap)
  const view = renderWithRouter(<PublishPropertyPage />, { route: '/publicar', path: '/publicar' })

  return { fakeMap, user: userEvent.setup(), view }
}

const publishButton = () => screen.getByRole('button', { name: 'Publicar propiedad' })

// Recorrer los tres pasos lleva muchas interacciones: se da más margen que el de una prueba normal.
describe('PublishPropertyPage', { timeout: 20_000 }, () => {
  beforeEach(() => {
    publish.mockReset()
  })

  it('muestra el título, el formulario y pone su título en la pestaña', async () => {
    // Arrange: visitante que quiere anunciar

    // Act
    setup()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Publica tu propiedad' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulario para publicar una propiedad' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(`Publicar propiedad | ${BRAND.name}`))
  })

  it('al confirmar la ubicación muestra un aviso de que se guardó', async () => {
    // Arrange
    const { fakeMap, user } = setup()

    // Act
    await fillLocationScreen(user, fakeMap)

    // Assert
    expect(await screen.findByText('Ubicación guardada con éxito.')).toBeInTheDocument()
  })

  it('guarda el anuncio completo y abre la ficha que devolvió el servicio', async () => {
    // Arrange
    publish.mockResolvedValue('anuncio-publicado')
    const { fakeMap, user, view } = setup()
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
    const { fakeMap, user } = setup()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos publicar tu propiedad')
  })
})
