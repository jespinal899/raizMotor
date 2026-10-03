import { describe, expect, it } from 'vitest'
import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import { buildProperty } from '@/test/factories'

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
    const result = await service.search({ type: 'terreno' })

    // Assert
    expect(result).toEqual([land])
  })

  it('search sin filtros devuelve todo sin modificar la lista original', async () => {
    // Arrange
    const properties = [buildProperty({ id: 'a' }), buildProperty({ id: 'b' })]
    const service = createInMemoryPropertyService(properties)

    // Act
    const result = await service.search({})

    // Assert
    expect(result).toEqual(properties)
    expect(result).not.toBe(properties)
  })
})
