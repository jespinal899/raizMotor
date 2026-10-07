import { describe, expect, it } from 'vitest'
import { sortProperties } from '@/features/properties/utils/sortProperties'
import { buildProperty } from '@/test/factories'

const CHEAP = buildProperty({ id: 'barata', price: 100000, area: 300 })
const MIDDLE = buildProperty({ id: 'media', price: 200000, area: 90 })
const EXPENSIVE = buildProperty({ id: 'cara', price: 300000, area: 150 })
const CATALOG = [MIDDLE, EXPENSIVE, CHEAP]

const idsOf = (properties: { id: string }[]) => properties.map(({ id }) => id)

describe('sortProperties', () => {
  it('sin orden deja las propiedades como vienen', () => {
    // Arrange
    const sort = undefined

    // Act
    const sorted = sortProperties(CATALOG, sort)

    // Assert
    expect(idsOf(sorted)).toEqual(['media', 'cara', 'barata'])
  })

  it('ordena por precio de menor a mayor', () => {
    // Arrange
    const sort = 'price-asc'

    // Act
    const sorted = sortProperties(CATALOG, sort)

    // Assert
    expect(idsOf(sorted)).toEqual(['barata', 'media', 'cara'])
  })

  it('ordena por precio de mayor a menor', () => {
    // Arrange
    const sort = 'price-desc'

    // Act
    const sorted = sortProperties(CATALOG, sort)

    // Assert
    expect(idsOf(sorted)).toEqual(['cara', 'media', 'barata'])
  })

  it('ordena por superficie de mayor a menor', () => {
    // Arrange
    const sort = 'area-desc'

    // Act
    const sorted = sortProperties(CATALOG, sort)

    // Assert
    expect(idsOf(sorted)).toEqual(['barata', 'cara', 'media'])
  })

  it('no altera la lista que recibe', () => {
    // Arrange
    const original = [...CATALOG]

    // Act
    sortProperties(original, 'price-asc')

    // Assert
    expect(original).toEqual(CATALOG)
  })

  it('a igual precio, conserva el orden en que venían', () => {
    // Arrange
    const first = buildProperty({ id: 'primera', price: 150000 })
    const second = buildProperty({ id: 'segunda', price: 150000 })

    // Act
    const sorted = sortProperties([first, second, CHEAP], 'price-desc')

    // Assert
    expect(idsOf(sorted)).toEqual(['primera', 'segunda', 'barata'])
  })
})
