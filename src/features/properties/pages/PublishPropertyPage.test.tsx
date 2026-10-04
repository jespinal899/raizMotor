import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublishPropertyPage from '@/features/properties/pages/PublishPropertyPage'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { PublicationUnavailableError, publicationService } from '@/features/properties/services/publicationService'
import { BRAND } from '@/shared/constants/brand'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { FILLED_PUBLICATION, fillPublicationForm } from '@/test/publicationForm'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))
vi.mock('@/features/properties/services/publicationService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/properties/services/publicationService')>()),
  publicationService: { publish: vi.fn() },
}))

const publish = vi.mocked(publicationService.publish)

const setup = () => {
  const fakeMap = buildFakeLocationMap()
  vi.mocked(createLeafletLocationMap).mockImplementation(fakeMap.createMap)
  renderWithRouter(<PublishPropertyPage />, { route: '/publicar' })

  return { fakeMap, user: userEvent.setup() }
}

const publishButton = () => screen.getByRole('button', { name: 'Publicar propiedad' })

describe('PublishPropertyPage', () => {
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

  it('envía el anuncio completo al servicio de publicación y confirma el resultado', async () => {
    // Arrange
    publish.mockResolvedValue(undefined)
    const { fakeMap, user } = setup()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(publish).toHaveBeenCalledExactlyOnceWith(FILLED_PUBLICATION)
    expect(await screen.findByRole('status')).toHaveTextContent('Tu propiedad se publicó')
  })

  it('si el servicio de publicación aún no está activo, lo avisa en lugar de confirmar', async () => {
    // Arrange
    publish.mockRejectedValue(new PublicationUnavailableError())
    const { fakeMap, user } = setup()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('La publicación aún no está disponible')
  })
})
