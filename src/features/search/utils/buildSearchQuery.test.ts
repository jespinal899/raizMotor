import { describe, expect, it } from 'vitest'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { buildSearchPath, parseSearchFilters, parseSearchPage } from '@/features/search/utils/buildSearchQuery'

describe('buildSearchPath', () => {
  it('devuelve la ruta base cuando no hay filtros', () => {
    // Arrange
    const filters: PropertyFilters = {}

    // Act
    const path = buildSearchPath(filters)

    // Assert
    expect(path).toBe('/propiedades')
  })

  it('pone el tipo en la ruta y el resto de filtros en la consulta', () => {
    // Arrange
    const filters: PropertyFilters = {
      type: 'casa',
      operation: 'venta',
      location: 'Miraflores',
      maxPrice: 500000,
    }

    // Act
    const path = buildSearchPath(filters)

    // Assert
    expect(path).toBe('/propiedades/casas?operacion=venta&ubicacion=Miraflores&precioMax=500000')
  })

  it('omite una ubicación vacía y recorta los espacios', () => {
    // Arrange
    const blank: PropertyFilters = { location: '   ' }
    const padded: PropertyFilters = { location: '  Cusco ' }

    // Act
    const blankPath = buildSearchPath(blank)
    const paddedPath = buildSearchPath(padded)

    // Assert
    expect(blankPath).toBe('/propiedades')
    expect(paddedPath).toBe('/propiedades?ubicacion=Cusco')
  })

  it('añade la página a partir de la segunda, conservando los filtros', () => {
    // Arrange
    const filters: PropertyFilters = { type: 'casa', operation: 'venta' }

    // Act
    const path = buildSearchPath(filters, 2)

    // Assert
    expect(path).toBe('/propiedades/casas?operacion=venta&pagina=2')
  })

  it('no escribe la primera página en la URL', () => {
    // Arrange
    const filters: PropertyFilters = { operation: 'alquiler' }

    // Act
    const path = buildSearchPath(filters, 1)

    // Assert
    expect(path).toBe('/propiedades?operacion=alquiler')
  })
})

describe('parseSearchPage', () => {
  it('lee el número de página de la consulta', () => {
    // Arrange
    const params = new URLSearchParams('operacion=venta&pagina=3')

    // Act
    const page = parseSearchPage(params)

    // Assert
    expect(page).toBe(3)
  })

  it('usa la primera página cuando la consulta no la indica', () => {
    // Arrange
    const params = new URLSearchParams('operacion=venta')

    // Act
    const page = parseSearchPage(params)

    // Assert
    expect(page).toBe(1)
  })

  it.each(['0', '-2', '2.5', 'abc', ''])('usa la primera página si el valor es "%s"', (value) => {
    // Arrange
    const params = new URLSearchParams({ pagina: value })

    // Act
    const page = parseSearchPage(params)

    // Assert
    expect(page).toBe(1)
  })

  it('recupera la página con la que se construyó la URL', () => {
    // Arrange
    const url = new URL(buildSearchPath({ type: 'terreno' }, 4), 'https://ejemplo.test')

    // Act
    const page = parseSearchPage(url.searchParams)

    // Assert
    expect(page).toBe(4)
  })
})

describe('parseSearchFilters', () => {
  it('lee el tipo de la ruta y los filtros de la consulta', () => {
    // Arrange
    const params = new URLSearchParams('operacion=alquiler&ubicacion=Barranco&precioMax=1000')

    // Act
    const filters = parseSearchFilters('apartamentos', params)

    // Assert
    expect(filters).toEqual({
      type: 'apartamento',
      operation: 'alquiler',
      location: 'Barranco',
      maxPrice: 1000,
    })
  })

  it('ignora valores inválidos en lugar de fallar', () => {
    // Arrange
    const params = new URLSearchParams('operacion=constructor&ubicacion=%20&precioMax=-5')

    // Act
    const filters = parseSearchFilters('castillos', params)

    // Assert
    expect(filters).toEqual({
      type: undefined,
      operation: undefined,
      location: undefined,
      maxPrice: undefined,
    })
  })

  it('ignora un precio que no es numérico', () => {
    // Arrange
    const params = new URLSearchParams('precioMax=barato')

    // Act
    const filters = parseSearchFilters(undefined, params)

    // Assert
    expect(filters.maxPrice).toBeUndefined()
  })

  it('recupera los mismos filtros con los que se construyó la URL', () => {
    // Arrange
    const original: PropertyFilters = {
      type: 'terreno',
      operation: 'venta',
      location: 'Valle Sagrado',
      maxPrice: 200000,
    }
    const url = new URL(buildSearchPath(original), 'https://ejemplo.test')
    const typeSlug = url.pathname.split('/').pop()

    // Act
    const parsed = parseSearchFilters(typeSlug, url.searchParams)

    // Assert
    expect(parsed).toEqual(original)
  })
})
