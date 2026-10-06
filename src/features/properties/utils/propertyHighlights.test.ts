import { describe, expect, it } from 'vitest'
import { getPropertyHighlights } from '@/features/properties/utils/propertyHighlights'
import { buildProperty } from '@/test/factories'

const summarize = (property: Parameters<typeof getPropertyHighlights>[0]) =>
  getPropertyHighlights(property).map(({ label, value }) => `${label}: ${value}`)

describe('getPropertyHighlights', () => {
  it('destaca dormitorios, baños y las dos superficies de una casa publicada, en ese orden', () => {
    // Arrange
    const house = buildProperty({ bedrooms: 3, bathrooms: 2, parking: undefined, builtArea: 180, landArea: 250 })

    // Act
    const highlights = summarize(house)

    // Assert
    expect(highlights).toEqual([
      'Dormitorios: 3',
      'Baños: 2',
      'Superficie construida: 180 m²',
      'Superficie del terreno: 250 m²',
    ])
  })

  it('incluye los estacionamientos cuando la propiedad los indica', () => {
    // Arrange
    const house = buildProperty({ bedrooms: 3, bathrooms: 2, parking: 2, builtArea: 180, landArea: 250 })

    // Act
    const highlights = summarize(house)

    // Assert
    expect(highlights).toContain('Estacionamientos: 2')
  })

  it('de un terreno solo destaca su superficie: no tiene dormitorios ni baños', () => {
    // Arrange
    const land = buildProperty({
      type: 'terreno',
      bedrooms: undefined,
      bathrooms: undefined,
      parking: undefined,
      landArea: 1200,
    })

    // Act
    const highlights = summarize(land)

    // Assert
    expect(highlights).toEqual(['Superficie del terreno: 1,200 m²'])
  })

  it('si la propiedad no distingue superficies, destaca la única que tiene', () => {
    // Arrange
    const sample = buildProperty({ bedrooms: 2, bathrooms: 1, parking: undefined, area: 95 })

    // Act
    const highlights = summarize(sample)

    // Assert
    expect(highlights).toEqual(['Dormitorios: 2', 'Baños: 1', 'Superficie: 95 m²'])
  })

  it('no repite la superficie general cuando ya se muestran la construida o la del terreno', () => {
    // Arrange
    const apartment = buildProperty({ type: 'apartamento', builtArea: 80, area: 80 })

    // Act
    const keys = getPropertyHighlights(apartment).map(({ key }) => key)

    // Assert
    expect(keys).not.toContain('area')
    expect(keys).toContain('builtArea')
  })

  it('da a cada dato una clave distinta, para poder asignarle su icono', () => {
    // Arrange
    const house = buildProperty({ bedrooms: 3, bathrooms: 2, parking: 1, builtArea: 180, landArea: 250 })

    // Act
    const keys = getPropertyHighlights(house).map(({ key }) => key)

    // Assert
    expect(keys).toEqual(['bedrooms', 'bathrooms', 'parking', 'builtArea', 'landArea'])
  })
})
