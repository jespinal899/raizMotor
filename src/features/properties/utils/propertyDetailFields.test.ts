import { describe, expect, it } from 'vitest'
import { getDetailFields } from '@/features/properties/utils/propertyDetailFields'

describe('getDetailFields', () => {
  it('una casa pide superficies, cuartos y baños', () => {
    // Arrange
    const type = 'casa'

    // Act
    const fields = getDetailFields(type)

    // Assert
    expect(fields).toEqual(['builtArea', 'landArea', 'bedrooms', 'bathrooms'])
  })

  it('un apartamento no pide superficie de terreno', () => {
    // Arrange
    const type = 'apartamento'

    // Act
    const fields = getDetailFields(type)

    // Assert
    expect(fields).toEqual(['builtArea', 'bedrooms', 'bathrooms'])
  })

  it('un terreno solo pide su superficie', () => {
    // Arrange
    const type = 'terreno'

    // Act
    const fields = getDetailFields(type)

    // Assert
    expect(fields).toEqual(['landArea'])
  })

  it('sin tipo elegido todavía no pide ningún dato', () => {
    // Arrange
    const type = ''

    // Act
    const fields = getDetailFields(type)

    // Assert
    expect(fields).toEqual([])
  })
})
