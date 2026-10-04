import { describe, expect, it } from 'vitest'
import { toPublication } from '@/features/properties/utils/toPublication'
import { buildImageFile, buildPublicationValues } from '@/test/factories'

describe('toPublication', () => {
  it('convierte los textos en números y quita los espacios sobrantes', () => {
    // Arrange
    const cover = buildImageFile({ name: 'portada.jpg' })
    const values = buildPublicationValues({
      department: 'cortes',
      city: '  San Pedro Sula ',
      neighborhood: ' Colonia Trejo ',
      address: ' 10 calle, casa 25 ',
      coordinates: { lat: 15.5, lng: -88.03 },
      type: 'casa',
      builtArea: '180',
      landArea: '250.5',
      bedrooms: '3',
      bathrooms: '2',
      title: '  Casa amplia con patio  ',
      description: '  Casa de una planta con patio amplio y cochera techada.  ',
      operation: 'venta',
      price: '145000',
      images: [cover],
    })

    // Act
    const publication = toPublication(values)

    // Assert
    expect(publication).toEqual({
      location: {
        department: 'cortes',
        city: 'San Pedro Sula',
        neighborhood: 'Colonia Trejo',
        address: '10 calle, casa 25',
        coordinates: { lat: 15.5, lng: -88.03 },
      },
      type: 'casa',
      builtArea: 180,
      landArea: 250.5,
      bedrooms: 3,
      bathrooms: 2,
      title: 'Casa amplia con patio',
      description: 'Casa de una planta con patio amplio y cochera techada.',
      operation: 'venta',
      price: 145000,
      images: [cover],
    })
  })

  it('en un terreno deja fuera los datos que no aplican, aunque se hubieran escrito', () => {
    // Arrange
    const values = buildPublicationValues({ type: 'terreno', landArea: '900', builtArea: '120', bedrooms: '3', bathrooms: '2' })

    // Act
    const publication = toPublication(values)

    // Assert
    expect(publication.landArea).toBe(900)
    expect(publication).not.toHaveProperty('builtArea')
    expect(publication).not.toHaveProperty('bedrooms')
    expect(publication).not.toHaveProperty('bathrooms')
  })

  it.each([
    { field: 'type', overrides: { type: '' } },
    { field: 'operation', overrides: { operation: '' } },
    { field: 'coordinates', overrides: { coordinates: null } },
  ] as const)('se niega a crear una publicación sin $field: el formulario debe validarse antes', ({ overrides }) => {
    // Arrange
    const values = buildPublicationValues(overrides)

    // Act
    const convert = () => toPublication(values)

    // Assert
    expect(convert).toThrow('El formulario debe validarse antes de crear la publicación.')
  })
})
