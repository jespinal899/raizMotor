import { describe, expect, it } from 'vitest'
import { matchesFilters } from '@/features/properties/utils/matchesFilters'
import { buildProperty } from '@/test/factories'

describe('matchesFilters', () => {
  it('acepta cualquier propiedad cuando no hay filtros', () => {
    // Arrange
    const property = buildProperty()

    // Act
    const matches = matchesFilters(property, {})

    // Assert
    expect(matches).toBe(true)
  })

  it('rechaza una propiedad de otro tipo', () => {
    // Arrange
    const property = buildProperty({ type: 'casa' })

    // Act
    const matches = matchesFilters(property, { type: 'terreno' })

    // Assert
    expect(matches).toBe(false)
  })

  it('rechaza una propiedad de otra operación', () => {
    // Arrange
    const property = buildProperty({ operation: 'venta' })

    // Act
    const matches = matchesFilters(property, { operation: 'alquiler' })

    // Assert
    expect(matches).toBe(false)
  })

  it('acepta una propiedad cuyo precio es igual al máximo', () => {
    // Arrange
    const property = buildProperty({ price: 200000 })

    // Act
    const matches = matchesFilters(property, { maxPrice: 200000 })

    // Assert
    expect(matches).toBe(true)
  })

  it('rechaza una propiedad que supera el precio máximo', () => {
    // Arrange
    const property = buildProperty({ price: 200001 })

    // Act
    const matches = matchesFilters(property, { maxPrice: 200000 })

    // Assert
    expect(matches).toBe(false)
  })

  it('encuentra la ubicación por distrito sin importar tildes ni mayúsculas', () => {
    // Arrange
    const property = buildProperty({ district: 'Víctor Larco', city: 'Trujillo' })

    // Act
    const matches = matchesFilters(property, { location: 'VICTOR larco' })

    // Assert
    expect(matches).toBe(true)
  })

  it('encuentra la ubicación por ciudad', () => {
    // Arrange
    const property = buildProperty({ district: 'Cayma', city: 'Arequipa' })

    // Act
    const matches = matchesFilters(property, { location: 'arequipa' })

    // Assert
    expect(matches).toBe(true)
  })

  it('ignora una ubicación que solo contiene espacios', () => {
    // Arrange
    const property = buildProperty()

    // Act
    const matches = matchesFilters(property, { location: '   ' })

    // Assert
    expect(matches).toBe(true)
  })

  it('exige que se cumplan todos los filtros a la vez', () => {
    // Arrange
    const property = buildProperty({ type: 'casa', operation: 'venta', price: 300000, district: 'Surco' })

    // Act
    const matches = matchesFilters(property, { type: 'casa', operation: 'venta', maxPrice: 250000 })

    // Assert
    expect(matches).toBe(false)
  })
})
