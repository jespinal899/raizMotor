import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EditPropertyPage from '@/features/properties/pages/EditPropertyPage'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { publicationService } from '@/features/properties/services/publicationService'
import type { StoredPublication } from '@/features/properties/services/publishedPropertyRepository'
import { toPublication } from '@/features/properties/utils/toPublication'
import { BRAND } from '@/shared/constants/brand'
import { buildPublicationValues } from '@/test/factories'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { anyOperationKey } from '@/test/operationKey'
import { goNext } from '@/test/publicationForm'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))
vi.mock('@/features/properties/services/geocodingService', () => ({
  geocodingService: { locate: vi.fn(async () => undefined) },
}))
vi.mock('@/features/properties/services/publicationService', () => ({
  publicationService: { getOwnPublication: vi.fn(), update: vi.fn() },
}))

const getOwnPublication = vi.mocked(publicationService.getOwnPublication)
const update = vi.mocked(publicationService.update)

const FORM_NAME = 'Formulario para editar una propiedad'
const AD_ID = 'anuncio-1'
/** Un anuncio tal como queda guardado: sus fotos ya son direcciones. */
const SAVED: StoredPublication = {
  ...toPublication(buildPublicationValues()),
  images: ['https://fotos.example/portada.webp'],
}

const renderPage = () => {
  vi.mocked(createLeafletLocationMap).mockImplementation(buildFakeLocationMap().createMap)

  return renderWithRouter(<EditPropertyPage />, {
    route: `/mis-publicaciones/${AD_ID}/editar`,
    path: '/mis-publicaciones/:id/editar',
  })
}

/** Avanza desde la ubicación, sin tocar nada, hasta la pantalla del precio. */
const goToPrice = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByRole('form', { name: FORM_NAME })
  for (const heading of ['Tipo de propiedad', 'Título y descripción', 'Venta o alquiler']) {
    await goNext(user)
    await screen.findByRole('heading', { level: 3, name: heading })
  }
}

const saveButton = () => screen.getByRole('button', { name: /^Guardar cambios$|Guardando/ })

// Recorrer las pantallas lleva muchas interacciones: se da más margen que el de una prueba normal.
describe('EditPropertyPage', { timeout: 20_000 }, () => {
  beforeEach(() => {
    getOwnPublication.mockReset()
    getOwnPublication.mockResolvedValue(SAVED)
    update.mockReset()
  })

  it('abre el formulario con los datos del anuncio y pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Editar anuncio | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    expect(await screen.findByRole('form', { name: FORM_NAME })).toBeInTheDocument()
    expect(getOwnPublication).toHaveBeenCalledExactlyOnceWith(AD_ID)
    expect(screen.getByRole('textbox', { name: 'Colonia, barrio o residencial' })).toHaveValue('Colonia Palmira')
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('no pide buscar otra vez la dirección: la ubicación ya estaba confirmada', async () => {
    // Arrange: anuncio con su punto en el mapa

    // Act
    renderPage()

    // Assert
    expect(await screen.findByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
  })

  it('mientras lee el anuncio muestra un marcador de carga', () => {
    // Arrange
    getOwnPublication.mockReturnValue(new Promise(() => {}))

    // Act
    renderPage()

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
  })

  it('si el anuncio no es de quien lo pide, o ya no existe, lo dice en lugar del formulario', async () => {
    // Arrange
    getOwnPublication.mockResolvedValue(undefined)

    // Act
    renderPage()

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'No puedes editar ese anuncio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver mis publicaciones' })).toHaveAttribute('href', '/mis-publicaciones')
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('guarda el precio corregido junto a lo que no cambió, y abre la ficha del anuncio', async () => {
    // Arrange
    const user = userEvent.setup()
    update.mockResolvedValue(undefined)
    const { currentPath } = renderPage()
    await goToPrice(user)
    await user.clear(screen.getByRole('spinbutton', { name: 'Precio (USD)' }))
    await user.type(screen.getByRole('spinbutton', { name: 'Precio (USD)' }), '139000')
    await goNext(user)

    // Act
    await user.click(saveButton())

    // Assert
    await waitFor(() => expect(currentPath()).toBe(`/propiedad/${AD_ID}`))
    expect(update).toHaveBeenCalledExactlyOnceWith(AD_ID, { ...SAVED, price: 139000 }, anyOperationKey())
  })

  it('si no se pudieron guardar los cambios lo avisa y sigue en el formulario', async () => {
    // Arrange
    const user = userEvent.setup()
    update.mockRejectedValue(new Error('sin conexión'))
    const { currentPath } = renderPage()
    await goToPrice(user)
    await goNext(user)

    // Act
    await user.click(saveButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar los cambios')
    expect(currentPath()).toBe(`/mis-publicaciones/${AD_ID}/editar`)
  })
})
