import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { propertyService } from '@/features/properties/services/propertyService'
import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import { publicationService } from '@/features/properties/services/publicationService'
import type { Property } from '@/features/properties/types/property.types'
import MyPropertiesPage from '@/pages/MyPropertiesPage'
import { BRAND } from '@/shared/constants/brand'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/propertyService', () => ({ propertyService: { getOwn: vi.fn() } }))
vi.mock('@/features/properties/services/publicationService', () => ({
  publicationService: { getLimit: vi.fn(), unpublish: vi.fn(), republish: vi.fn(), remove: vi.fn() },
}))

const getOwn = vi.mocked(propertyService.getOwn)
const getLimit = vi.mocked(publicationService.getLimit)
const unpublish = vi.mocked(publicationService.unpublish)
const republish = vi.mocked(publicationService.republish)
const remove = vi.mocked(publicationService.remove)

const HOUSE = buildProperty({ id: 'casa-1', title: 'Casa con jardín' })
const LAND = buildProperty({ id: 'terreno-1', title: 'Terreno en Valle de Ángeles', type: 'terreno' })
/** La retiró del catálogo quien la publicó. */
const FLAT = buildProperty({ id: 'apto-1', title: 'Apartamento en Palmira', type: 'apartamento', withdrawn: 'byOwner' })
/** La retiró el equipo del sitio. */
const LOT = buildProperty({ id: 'lote-1', title: 'Lote en Santa Lucía', type: 'terreno', withdrawn: 'bySite' })

const AGENT_PRO_LIMIT = 25

const renderPage = (own: Property[] = [HOUSE, LAND], limit = AGENT_PRO_LIMIT) => {
  getOwn.mockResolvedValue(own)
  getLimit.mockResolvedValue(limit)

  return { user: userEvent.setup(), ...renderWithRouter(<MyPropertiesPage />, { route: '/mis-publicaciones', path: '/mis-publicaciones' }) }
}

/** Una pestaña, por su nombre con la cuenta de las que tiene: «Publicadas (2)». */
const tab = (name: string) => screen.findByRole('tab', { name })
const openTab = async (user: UserEvent, name: string) => user.click(await tab(name))
/** Los títulos de las publicaciones de la pestaña abierta, que es la única que se ve. */
const shownTitles = () =>
  within(screen.getByRole('tabpanel'))
    .queryAllByRole('heading', { level: 3 })
    .map((title) => title.textContent)
const banner = async () => within(await screen.findByRole('region', { name: 'Tu plan activo' }))
/** Lo que acompaña a una publicación: su tarjeta y sus botones. */
const item = async (title: string) => within((await screen.findByRole('heading', { name: title })).closest('li')!)

/** Con la ventana de confirmar abierta, el resto de la página queda oculto a los lectores de pantalla: se busca igual. */
const publication = (title: string) => screen.queryByRole('heading', { name: title, hidden: true })

/** Abre la ventana que pide confirmar el borrado de la publicación con ese título. */
const askToDelete = async (user: UserEvent, title: string) => {
  await user.click((await item(title)).getByRole('button', { name: 'Eliminar' }))

  return within(await screen.findByRole('dialog'))
}

describe('MyPropertiesPage', () => {
  beforeEach(() => {
    getOwn.mockReset()
    getLimit.mockReset()
    unpublish.mockReset()
    republish.mockReset()
    remove.mockReset()
  })

  it('se llama «Mis publicaciones» y pone su título en la pestaña del navegador', async () => {
    // Arrange
    const expectedTitle = `Mis publicaciones | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis publicaciones' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('ofrece dos pestañas en la misma línea, «Publicadas» y «Despublicadas», con cuántas hay en cada una', async () => {
    // Arrange
    const own = [HOUSE, FLAT, LAND, LOT]

    // Act
    renderPage(own)

    // Assert
    const tabs = within(await screen.findByRole('tablist')).getAllByRole('tab')
    expect(tabs.map((each) => each.textContent)).toEqual(['Publicadas (2)', 'Despublicadas (2)'])
  })

  it('se abre en «Publicadas», que queda marcada como la activa, y muestra solo las del catálogo', async () => {
    // Arrange
    const own = [HOUSE, FLAT, LAND, LOT]

    // Act
    renderPage(own)

    // Assert
    expect(await tab('Publicadas (2)')).toHaveAttribute('aria-selected', 'true')
    expect(await tab('Despublicadas (2)')).toHaveAttribute('aria-selected', 'false')
    expect(shownTitles()).toEqual(['Casa con jardín', 'Terreno en Valle de Ángeles'])
  })

  it('al elegir «Despublicadas» pasa a ser la activa y muestra las que no están en el catálogo', async () => {
    // Arrange
    const { user } = renderPage([HOUSE, FLAT, LAND, LOT])

    // Act
    await openTab(user, 'Despublicadas (2)')

    // Assert
    expect(await tab('Despublicadas (2)')).toHaveAttribute('aria-selected', 'true')
    expect(await tab('Publicadas (2)')).toHaveAttribute('aria-selected', 'false')
    expect(shownTitles()).toEqual(['Apartamento en Palmira', 'Lote en Santa Lucía'])
  })

  it('el banner dice el plan de la cuenta y cuenta solo las publicadas', async () => {
    // Arrange
    const own = [HOUSE, FLAT, LOT]

    // Act
    renderPage(own, AGENT_PRO_LIMIT)

    // Assert
    const plan = await banner()
    expect(plan.getByText('Agente Pro')).toBeInTheDocument()
    expect(plan.getByText('1/25')).toBeInTheDocument()
    expect(plan.getByRole('link', { name: 'Publicar una propiedad' })).toHaveAttribute('href', '/publicar')
  })

  it('con el plan gratuito y su publicación ya en el catálogo, el banner dice que está completo', async () => {
    // Arrange
    const freeLimit = 1

    // Act
    renderPage([HOUSE], freeLimit)

    // Assert
    const plan = await banner()
    expect(plan.getByText('Propietario')).toBeInTheDocument()
    expect(plan.getByText('1/1')).toBeInTheDocument()
    expect(plan.getByRole('link', { name: 'Ver planes' })).toHaveAttribute('href', '/planes')
  })

  it('cada publicación lleva a su formulario para corregirla, esté publicada o no', async () => {
    // Arrange
    const { user } = renderPage([HOUSE, FLAT])
    const published = (await item('Casa con jardín')).getByRole('link', { name: 'Editar' }).getAttribute('href')

    // Act
    await openTab(user, 'Despublicadas (1)')

    // Assert
    expect(published).toBe('/mis-publicaciones/casa-1/editar')
    expect((await item('Apartamento en Palmira')).getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/mis-publicaciones/apto-1/editar',
    )
  })

  it('mientras las lee muestra un marcador de carga', () => {
    // Arrange
    getOwn.mockReturnValue(new Promise<Property[]>(() => {}))
    getLimit.mockResolvedValue(1)

    // Act
    renderWithRouter(<MyPropertiesPage />)

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
  })

  it('a quien aún no tiene ninguna se lo dice en cada pestaña, y el banner le ofrece publicar', async () => {
    // Arrange: cuenta sin publicaciones, con el plan gratuito
    const { user } = renderPage([], 1)
    const published = (await screen.findByRole('tabpanel')).textContent

    // Act
    await openTab(user, 'Despublicadas (0)')

    // Assert
    expect(published).toBe('No tienes publicaciones en el catálogo.')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('No tienes publicaciones despublicadas.')
    const plan = await banner()
    expect(plan.getByText('0/1')).toBeInTheDocument()
    expect(plan.getByRole('link', { name: 'Publicar una propiedad' })).toHaveAttribute('href', '/publicar')
  })

  it('si no se pudieron leer lo dice, en lugar de afirmar que no hay ninguna', async () => {
    // Arrange
    getOwn.mockRejectedValue(new Error('sin conexión'))
    getLimit.mockResolvedValue(1)

    // Act
    renderWithRouter(<MyPropertiesPage />)

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'No pudimos cargar tus publicaciones' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('despublicar una publicación la pasa a la otra pestaña y deja libre su lugar en el plan', async () => {
    // Arrange
    unpublish.mockResolvedValue(undefined)
    const { user } = renderPage([HOUSE, LAND])

    // Act
    await user.click((await item('Casa con jardín')).getByRole('button', { name: 'Despublicar' }))

    // Assert
    expect(await tab('Publicadas (1)')).toHaveAttribute('aria-selected', 'true')
    expect(await tab('Despublicadas (1)')).toBeInTheDocument()
    expect(shownTitles()).toEqual(['Terreno en Valle de Ángeles'])
    expect(unpublish).toHaveBeenCalledExactlyOnceWith('casa-1')
    expect((await banner()).getByText('1/25')).toBeInTheDocument()
  })

  it('una publicación recién despublicada aparece en «Despublicadas», y ya ofrece volver a publicarla', async () => {
    // Arrange
    unpublish.mockResolvedValue(undefined)
    const { user } = renderPage([HOUSE])
    await user.click((await item('Casa con jardín')).getByRole('button', { name: 'Despublicar' }))

    // Act
    await openTab(user, 'Despublicadas (1)')

    // Assert
    const actions = await item('Casa con jardín')
    expect(actions.getByRole('button', { name: 'Volver a publicar' })).toBeInTheDocument()
    expect(actions.getByText('Despublicada')).toBeInTheDocument()
  })

  it('volver a publicar la devuelve a «Publicadas» y ocupa su lugar en el plan', async () => {
    // Arrange
    republish.mockResolvedValue(undefined)
    const { user } = renderPage([HOUSE, FLAT])
    await openTab(user, 'Despublicadas (1)')

    // Act
    await user.click((await item('Apartamento en Palmira')).getByRole('button', { name: 'Volver a publicar' }))

    // Assert
    expect(await tab('Despublicadas (0)')).toHaveAttribute('aria-selected', 'true')
    expect(shownTitles()).toEqual([])
    expect(republish).toHaveBeenCalledExactlyOnceWith('apto-1')
    expect((await banner()).getByText('2/25')).toBeInTheDocument()
    await openTab(user, 'Publicadas (2)')
    expect(shownTitles()).toEqual(['Casa con jardín', 'Apartamento en Palmira'])
  })

  it('si el plan ya está completo, volver a publicar lo explica y la publicación sigue despublicada', async () => {
    // Arrange
    republish.mockRejectedValue(new PublicationLimitError())
    const { user } = renderPage([HOUSE, FLAT], 1)
    await openTab(user, 'Despublicadas (1)')

    // Act
    await user.click((await item('Apartamento en Palmira')).getByRole('button', { name: 'Volver a publicar' }))

    // Assert
    expect(await (await item('Apartamento en Palmira')).findByRole('alert')).toHaveTextContent('Tu plan está completo')
    expect(await tab('Despublicadas (1)')).toBeInTheDocument()
    expect(shownTitles()).toEqual(['Apartamento en Palmira'])
  })

  it.each([
    {
      when: 'despublicar',
      own: [HOUSE],
      stays: 'Publicadas (1)',
      title: 'Casa con jardín',
      button: 'Despublicar',
      action: unpublish,
      message: 'No pudimos despublicarla',
    },
    {
      when: 'volver a publicar',
      own: [FLAT],
      stays: 'Despublicadas (1)',
      title: 'Apartamento en Palmira',
      button: 'Volver a publicar',
      action: republish,
      message: 'No pudimos volver a publicarla',
    },
  ])('si no se pudo $when lo avisa y la publicación se queda donde estaba', async ({ own, stays, title, button, action, message }) => {
    // Arrange
    action.mockRejectedValue(new Error('sin conexión'))
    const { user } = renderPage(own)
    await openTab(user, stays)

    // Act
    await user.click((await item(title)).getByRole('button', { name: button }))

    // Assert
    expect(await (await item(title)).findByRole('alert')).toHaveTextContent(message)
    expect(await tab(stays)).toHaveAttribute('aria-selected', 'true')
    expect(shownTitles()).toEqual([title])
  })

  it('una publicación que ocultó el equipo del sitio no se puede volver a publicar, y dice por qué', async () => {
    // Arrange
    const { user } = renderPage([LOT])

    // Act
    await openTab(user, 'Despublicadas (1)')

    // Assert
    const actions = await item('Lote en Santa Lucía')
    expect(actions.queryByRole('button', { name: 'Volver a publicar' })).not.toBeInTheDocument()
    expect(actions.getByText(/La ocultó el equipo del sitio/)).toBeInTheDocument()
    expect(actions.getByRole('link', { name: 'Contáctanos' })).toHaveAttribute('href', '/contacto')
    expect(actions.getByRole('link', { name: 'Editar' })).toBeInTheDocument()
    expect(actions.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('antes de eliminar una publicación pide confirmarlo, diciendo cuál es y que no se puede deshacer', async () => {
    // Arrange
    const { user } = renderPage()

    // Act
    const dialog = await askToDelete(user, 'Casa con jardín')

    // Assert
    expect(dialog.getByRole('heading', { name: '¿Eliminar esta publicación?' })).toBeInTheDocument()
    expect(dialog.getByText(/«Casa con jardín»/)).toHaveTextContent('No se puede deshacer.')
    expect(remove).not.toHaveBeenCalled()
  })

  it('al confirmarlo elimina esa publicación y la quita de su pestaña, sin tocar las demás', async () => {
    // Arrange
    remove.mockResolvedValue(undefined)
    const { user } = renderPage([HOUSE, LAND, FLAT])
    const dialog = await askToDelete(user, 'Casa con jardín')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Eliminar publicación' }))

    // Assert
    await waitFor(() => expect(publication('Casa con jardín')).not.toBeInTheDocument())
    expect(remove).toHaveBeenCalledExactlyOnceWith('casa-1')
    expect(await tab('Publicadas (1)')).toBeInTheDocument()
    expect(await tab('Despublicadas (1)')).toBeInTheDocument()
    expect(shownTitles()).toEqual(['Terreno en Valle de Ángeles'])
  })

  it('una despublicada también se puede eliminar', async () => {
    // Arrange
    remove.mockResolvedValue(undefined)
    const { user } = renderPage([HOUSE, FLAT])
    await openTab(user, 'Despublicadas (1)')
    const dialog = await askToDelete(user, 'Apartamento en Palmira')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Eliminar publicación' }))

    // Assert
    await waitFor(() => expect(publication('Apartamento en Palmira')).not.toBeInTheDocument())
    expect(remove).toHaveBeenCalledExactlyOnceWith('apto-1')
    expect(await tab('Despublicadas (0)')).toBeInTheDocument()
  })

  it('si se cancela, no elimina nada', async () => {
    // Arrange
    const { user } = renderPage()
    const dialog = await askToDelete(user, 'Casa con jardín')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Cancelar' }))

    // Assert
    expect(remove).not.toHaveBeenCalled()
    expect(publication('Casa con jardín')).toBeInTheDocument()
  })

  it('si no se pudo eliminar lo avisa y la publicación sigue en la lista', async () => {
    // Arrange
    remove.mockRejectedValue(new Error('sin conexión'))
    const { user } = renderPage()
    const dialog = await askToDelete(user, 'Casa con jardín')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Eliminar publicación' }))

    // Assert
    expect(await dialog.findByRole('alert')).toHaveTextContent('No pudimos eliminar la publicación')
    expect(publication('Casa con jardín')).toBeInTheDocument()
  })
})
