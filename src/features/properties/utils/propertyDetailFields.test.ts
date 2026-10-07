import { describe, expect, it } from 'vitest'
import { getAmenities, getDetailFields } from '@/features/properties/utils/propertyDetailFields'

describe('getDetailFields', () => {
  it('una casa pide superficies, cuartos, baños y estacionamientos', () => {
    // Arrange
    const type = 'casa'

    // Act
    const fields = getDetailFields(type)

    // Assert
    expect(fields).toEqual(['builtArea', 'landArea', 'bedrooms', 'bathrooms', 'parking'])
  })

  it('un apartamento no pide superficie de terreno', () => {
    // Arrange
    const type = 'apartamento'

    // Act
    const fields = getDetailFields(type)

    // Assert
    expect(fields).toEqual(['builtArea', 'bedrooms', 'bathrooms', 'parking'])
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

describe('getAmenities', () => {
  it('una casa ofrece comodidades de vivienda, como piscina o jardín', () => {
    // Arrange
    const type = 'casa'

    // Act
    const amenities = getAmenities(type)

    // Assert
    expect(amenities).toEqual(expect.arrayContaining(['Piscina', 'Jardín', 'Terraza', 'Cocina equipada']))
    expect(amenities).not.toContain('Terreno plano')
  })

  it('un apartamento ofrece además las del edificio, como el ascensor, y no el jardín', () => {
    // Arrange
    const type = 'apartamento'

    // Act
    const amenities = getAmenities(type)

    // Assert
    expect(amenities).toEqual(expect.arrayContaining(['Ascensor', 'Área social', 'Terraza']))
    expect(amenities).not.toContain('Jardín')
  })

  it('un terreno ofrece las suyas: servicios y acceso', () => {
    // Arrange
    const type = 'terreno'

    // Act
    const amenities = getAmenities(type)

    // Assert
    expect(amenities).toEqual(['Terreno plano', 'Agua potable', 'Energía eléctrica', 'Acceso vehicular', 'Cercado'])
  })

  it('sin tipo elegido todavía no ofrece ninguna', () => {
    // Arrange
    const type = ''

    // Act
    const amenities = getAmenities(type)

    // Assert
    expect(amenities).toEqual([])
  })

  it('no repite ninguna comodidad dentro de un mismo tipo', () => {
    // Arrange
    const types = ['casa', 'apartamento', 'terreno'] as const

    // Act
    const lists = types.map(getAmenities)

    // Assert
    expect(lists.every((list) => new Set(list).size === list.length)).toBe(true)
  })
})
