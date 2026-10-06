import { describe, expect, it } from 'vitest'
import { getPropertyStats } from '@/features/properties/utils/propertyStats'

describe('getPropertyStats', () => {
  it('devuelve dormitorios, baños y área de una vivienda', () => {
    // Arrange
    const house = { bedrooms: 3, bathrooms: 2, area: 180 }

    // Act
    const stats = getPropertyStats(house)

    // Assert
    expect(stats).toEqual([
      { key: 'bedrooms', text: '3 dorm.' },
      { key: 'bathrooms', text: '2 baños' },
      { key: 'area', text: '180 m²' },
    ])
  })

  it('usa el singular cuando hay un solo baño', () => {
    // Arrange
    const studio = { bedrooms: 1, bathrooms: 1, area: 40 }

    // Act
    const stats = getPropertyStats(studio)

    // Assert
    expect(stats.find((stat) => stat.key === 'bathrooms')?.text).toBe('1 baño')
  })

  it('en un terreno solo devuelve el área', () => {
    // Arrange
    const land = { area: 1000 }

    // Act
    const stats = getPropertyStats(land)

    // Assert
    expect(stats).toEqual([{ key: 'area', text: '1,000 m²' }])
  })

  it('conserva un cero explícito en lugar de ocultarlo', () => {
    // Arrange
    const loft = { bedrooms: 0, bathrooms: 1, area: 35 }

    // Act
    const stats = getPropertyStats(loft)

    // Assert
    expect(stats[0]).toEqual({ key: 'bedrooms', text: '0 dorm.' })
  })
})
