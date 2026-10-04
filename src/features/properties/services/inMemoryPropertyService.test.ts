import { describe, expect, it } from 'vitest'
import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import { buildProperties, buildProperty } from '@/test/factories'

const FIRST_PAGE = { page: 1, pageSize: 6 }

describe('createInMemoryPropertyService', () => {
  it('getFeatured devuelve solo las propiedades destacadas', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const regular = buildProperty({ id: 'normal', featured: false })
    const service = createInMemoryPropertyService([featured, regular])

    // Act
    const result = await service.getFeatured()

    // Assert
    expect(result).toEqual([featured])
  })

  it('search devuelve las propiedades que cumplen los filtros', async () => {
    // Arrange
    const house = buildProperty({ id: 'casa', type: 'casa' })
    const land = buildProperty({ id: 'terreno', type: 'terreno' })
    const service = createInMemoryPropertyService([house, land])

    // Act
    const result = await service.search({ type: 'terreno' }, FIRST_PAGE)

    // Assert
    expect(result.items).toEqual([land])
    expect(result.total).toBe(1)
  })

  it('search sin filtros devuelve todo sin modificar la lista original', async () => {
    // Arrange
    const properties = buildProperties(2)
    const service = createInMemoryPropertyService(properties)

    // Act
    const result = await service.search({}, FIRST_PAGE)

    // Assert
    expect(result.items).toEqual(properties)
    expect(result.items).not.toBe(properties)
  })

  it('search entrega solo la página pedida y el total de páginas', async () => {
    // Arrange
    const properties = buildProperties(11)
    const service = createInMemoryPropertyService(properties)

    // Act
    const result = await service.search({}, { page: 2, pageSize: 6 })

    // Assert
    expect(result.items.map((property) => property.title)).toEqual([
      'Propiedad 7',
      'Propiedad 8',
      'Propiedad 9',
      'Propiedad 10',
      'Propiedad 11',
    ])
    expect(result).toMatchObject({ total: 11, page: 2, pageSize: 6, totalPages: 2 })
  })

  it('search pagina sobre los resultados filtrados, no sobre el catálogo completo', async () => {
    // Arrange
    const houses = buildProperties(8)
    const lands = [buildProperty({ id: 'terreno-1', type: 'terreno' }), buildProperty({ id: 'terreno-2', type: 'terreno' })]
    const service = createInMemoryPropertyService([...houses, ...lands])

    // Act
    const result = await service.search({ type: 'terreno' }, FIRST_PAGE)

    // Assert
    expect(result).toMatchObject({ total: 2, totalPages: 1 })
    expect(result.items).toEqual(lands)
  })

  it('search ajusta a la última página una página fuera de rango', async () => {
    // Arrange
    const service = createInMemoryPropertyService(buildProperties(11))

    // Act
    const result = await service.search({}, { page: 50, pageSize: 6 })

    // Assert
    expect(result.page).toBe(2)
    expect(result.items).toHaveLength(5)
  })

  it('getById devuelve la propiedad con ese identificador', async () => {
    // Arrange
    const wanted = buildProperty({ id: 'buscada' })
    const service = createInMemoryPropertyService([buildProperty({ id: 'otra' }), wanted])

    // Act
    const result = await service.getById('buscada')

    // Assert
    expect(result).toEqual(wanted)
  })

  it('getById devuelve undefined cuando el identificador no existe', async () => {
    // Arrange
    const service = createInMemoryPropertyService([buildProperty({ id: 'unica' })])

    // Act
    const result = await service.getById('inexistente')

    // Assert
    expect(result).toBeUndefined()
  })
})
