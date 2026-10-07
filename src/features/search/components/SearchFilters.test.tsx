import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import SearchFilters from '@/features/search/components/SearchFilters'
import { renderWithRouter } from '@/test/renderWithRouter'

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()
const group = () => screen.getByRole('group', { name: 'Afinar la búsqueda' })
const field = (name: string) => within(group()).getByRole('combobox', { name })

/** Elige una opción como lo haría una persona: abre el desplegable y pulsa la opción. */
const choose = async (fieldName: string, option: string | RegExp, filters: PropertyFilters = {}) => {
  const user = userEvent.setup()
  const view = renderWithRouter(<SearchFilters filters={filters} />, { route: '/propiedades?pagina=2' })
  await user.click(field(fieldName))
  await user.click(await screen.findByRole('option', { name: option }))

  return view
}

describe('SearchFilters', () => {
  it('ofrece afinar por precio mínimo, dormitorios y baños, y ordenar los resultados', () => {
    // Arrange
    const filters: PropertyFilters = {}

    // Act
    renderWithRouter(<SearchFilters filters={filters} />)

    // Assert
    expect(textOf(field('Precio mínimo'))).toContain('Sin mínimo')
    expect(textOf(field('Dormitorios'))).toContain('Cualquiera')
    expect(textOf(field('Baños'))).toContain('Cualquiera')
    expect(textOf(field('Ordenar por'))).toContain('Predeterminado')
  })

  it('refleja lo que ya está aplicado en la búsqueda', () => {
    // Arrange
    const filters: PropertyFilters = {
      operation: 'venta',
      minPrice: 100000,
      minBedrooms: 3,
      minBathrooms: 2,
      sort: 'price-asc',
    }

    // Act
    renderWithRouter(<SearchFilters filters={filters} />)

    // Assert
    expect(textOf(field('Precio mínimo'))).toContain('Desde $ 100,000')
    expect(textOf(field('Dormitorios'))).toContain('3 o más')
    expect(textOf(field('Baños'))).toContain('2 o más')
    expect(textOf(field('Ordenar por'))).toContain('Precio: de menor a mayor')
  })

  it('al elegir dormitorios aplica el filtro al momento, en la dirección de la búsqueda', async () => {
    // Arrange: búsqueda sin filtros

    // Act
    const { currentPath } = await choose('Dormitorios', '3 o más')

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/propiedades?dormitorios=3'))
  })

  it('conserva los demás filtros de la búsqueda y vuelve a la primera página', async () => {
    // Arrange
    const filters: PropertyFilters = { type: 'casa', operation: 'venta', location: 'Tegucigalpa', maxPrice: 350000 }

    // Act
    const { currentPath } = await choose('Baños', '2 o más', filters)

    // Assert
    await waitFor(() =>
      expect(currentPath()).toBe('/propiedades/casas?operacion=venta&ubicacion=Tegucigalpa&precioMax=350000&banos=2'),
    )
  })

  it('al elegir un orden lo lleva a la dirección de la búsqueda', async () => {
    // Arrange: búsqueda sin filtros

    // Act
    const { currentPath } = await choose('Ordenar por', 'Precio: de mayor a menor')

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/propiedades?orden=price-desc'))
  })

  it('elegir "Cualquiera" retira el filtro', async () => {
    // Arrange
    const filters: PropertyFilters = { minBedrooms: 3, minBathrooms: 2 }

    // Act
    const { currentPath } = await choose('Dormitorios', 'Cualquiera', filters)

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/propiedades?banos=2'))
  })

  it('el precio mínimo ofrece la escala del alquiler cuando se buscan alquileres', async () => {
    // Arrange
    const filters: PropertyFilters = { operation: 'alquiler' }

    // Act
    // El símbolo y la cifra van unidos por un espacio de no separación.
    const { currentPath } = await choose('Precio mínimo', /^Desde \$\s500$/, filters)

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/propiedades?operacion=alquiler&precioMin=500'))
  })
})
