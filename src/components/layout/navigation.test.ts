import { describe, expect, it } from 'vitest'
import { PROPERTY_CATEGORIES } from '@/components/layout/navigation'
import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import { parseSearchFilters } from '@/features/search/utils/buildSearchQuery'

describe('PROPERTY_CATEGORIES', () => {
  it('ofrece terrenos, casas y apartamentos, en ese orden', () => {
    // Arrange
    const expectedLabels = ['Terrenos', 'Casas', 'Apartamentos']

    // Act
    const labels = PROPERTY_CATEGORIES.map((category) => category.label)

    // Assert
    expect(labels).toEqual(expectedLabels)
  })

  it('cada enlace del menú abre resultados filtrados por un tipo que existe', () => {
    // Arrange
    const knownTypes = Object.keys(PROPERTY_TYPES)

    // Act
    const typesFromLinks = PROPERTY_CATEGORIES.map(
      ({ to }) => parseSearchFilters(to.split('/').pop(), new URLSearchParams()).type,
    )

    // Assert
    expect(typesFromLinks).toEqual(['terreno', 'casa', 'apartamento'])
    expect(knownTypes).toEqual(expect.arrayContaining(typesFromLinks))
  })
})
