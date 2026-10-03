import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import SearchBar from '@/features/search/components/SearchBar'
import { renderWithRouter } from '@/test/renderWithRouter'

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('SearchBar', () => {
  it('arranca con Comprar seleccionado y sin más filtros', () => {
    // Arrange: sin filtros iniciales

    // Act
    renderWithRouter(<SearchBar />)

    // Assert
    expect(screen.getByRole('button', { name: 'Comprar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('textbox', { name: 'Ubicación' })).toHaveValue('')
    expect(textOf(screen.getByRole('combobox', { name: 'Tipo de propiedad' }))).toContain('Todos los tipos')
    expect(textOf(screen.getByRole('combobox', { name: 'Precio máximo' }))).toContain('Sin límite')
  })

  it('refleja los filtros iniciales en los campos', () => {
    // Arrange
    const initialFilters = {
      type: 'casa',
      operation: 'alquiler',
      location: 'Surco',
      maxPrice: 1500,
    } as const

    // Act
    renderWithRouter(<SearchBar initialFilters={initialFilters} />)

    // Assert
    expect(screen.getByRole('button', { name: 'Alquilar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('textbox', { name: 'Ubicación' })).toHaveValue('Surco')
    expect(textOf(screen.getByRole('combobox', { name: 'Tipo de propiedad' }))).toContain('Casas')
    expect(textOf(screen.getByRole('combobox', { name: 'Precio máximo' }))).toContain('Hasta $ 1,500')
  })

  it('al buscar navega a los resultados con la ubicación escrita', async () => {
    // Arrange
    const user = userEvent.setup()
    const { currentPath } = renderWithRouter(<SearchBar />)
    await user.type(screen.getByRole('textbox', { name: 'Ubicación' }), 'Miraflores')

    // Act
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    // Assert
    expect(currentPath()).toBe('/propiedades?operacion=venta&ubicacion=Miraflores')
  })

  it('envía la búsqueda al pulsar Enter en la ubicación', async () => {
    // Arrange
    const user = userEvent.setup()
    const { currentPath } = renderWithRouter(<SearchBar initialFilters={{ type: 'terreno' }} />)

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Ubicación' }), 'Cusco{Enter}')

    // Assert
    expect(currentPath()).toBe('/propiedades/terrenos?ubicacion=Cusco')
  })

  it('al cambiar de operación descarta el precio máximo elegido', async () => {
    // Arrange
    const user = userEvent.setup()
    const { currentPath } = renderWithRouter(
      <SearchBar initialFilters={{ operation: 'venta', maxPrice: 500000 }} />,
    )

    // Act
    await user.click(screen.getByRole('button', { name: 'Alquilar' }))
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    // Assert
    expect(textOf(screen.getByRole('combobox', { name: 'Precio máximo' }))).toContain('Sin límite')
    expect(currentPath()).toBe('/propiedades?operacion=alquiler')
  })
})
