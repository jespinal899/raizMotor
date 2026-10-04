import { describe, expect, it } from 'vitest'
import { validatePublication } from '@/features/properties/utils/publicationValidation'
import { hasErrors } from '@/shared/utils/validators'
import { buildPublicationValues } from '@/test/factories'

describe('validatePublication', () => {
  it('no encuentra errores en una casa con todos sus datos', () => {
    // Arrange
    const values = buildPublicationValues()

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(hasErrors(errors)).toBe(false)
  })

  it('exige la ubicación completa y el punto en el mapa', () => {
    // Arrange
    const values = buildPublicationValues({ department: '', city: ' ', neighborhood: '', address: '', coordinates: null })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors).toMatchObject({
      department: 'Selecciona el departamento.',
      city: 'Escribe la ciudad.',
      neighborhood: 'Escribe la colonia o el barrio.',
      address: 'Escribe la dirección.',
      coordinates: 'Mueve el mapa hasta dejar el marcador sobre la propiedad.',
    })
  })

  it('rechaza un departamento que no existe', () => {
    // Arrange
    const values = buildPublicationValues({ department: 'lima' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.department).toBe('Selecciona el departamento.')
  })

  it('pide más detalle cuando la dirección es demasiado corta', () => {
    // Arrange
    const values = buildPublicationValues({ address: 'C 1' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.address).toBe('Añade más detalle a la dirección: calle, bloque o número de casa.')
  })

  it('exige el tipo de propiedad y la operación', () => {
    // Arrange
    const values = buildPublicationValues({ type: '', operation: '' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.type).toBe('Selecciona el tipo de propiedad.')
    expect(errors.operation).toBe('Indica si es venta o alquiler.')
  })

  it('en una casa exige superficies, cuartos y baños', () => {
    // Arrange
    const values = buildPublicationValues({ type: 'casa', builtArea: '', landArea: '', bedrooms: '', bathrooms: '' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors).toMatchObject({
      builtArea: 'Indica la superficie construida.',
      landArea: 'Indica la superficie del terreno.',
      bedrooms: 'Indica cuántos cuartos tiene.',
      bathrooms: 'Indica cuántos baños tiene.',
    })
  })

  it('en un terreno solo exige su superficie', () => {
    // Arrange
    const values = buildPublicationValues({ type: 'terreno', builtArea: '', landArea: '', bedrooms: '', bathrooms: '' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.landArea).toBe('Indica la superficie del terreno.')
    expect(errors.builtArea).toBeUndefined()
    expect(errors.bedrooms).toBeUndefined()
    expect(errors.bathrooms).toBeUndefined()
  })

  it('en un apartamento no exige la superficie del terreno', () => {
    // Arrange
    const values = buildPublicationValues({ type: 'apartamento', landArea: '' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(hasErrors(errors)).toBe(false)
  })

  it('sin tipo elegido no reclama datos que aún no se muestran', () => {
    // Arrange
    const values = buildPublicationValues({ type: '', builtArea: '', landArea: '', bedrooms: '', bathrooms: '' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.builtArea).toBeUndefined()
    expect(errors.landArea).toBeUndefined()
  })

  it('rechaza superficies en cero o negativas y cuartos con decimales', () => {
    // Arrange
    const values = buildPublicationValues({ builtArea: '0', landArea: '-20', bedrooms: '2.5', bathrooms: 'dos' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors).toMatchObject({
      builtArea: 'La superficie construida debe ser mayor que 0.',
      landArea: 'La superficie del terreno debe ser mayor que 0.',
      bedrooms: 'Los cuartos deben ser un número entero.',
      bathrooms: 'Los baños deben ser un número entero.',
    })
  })

  it('acepta cero cuartos, como en un monoambiente', () => {
    // Arrange
    const values = buildPublicationValues({ type: 'apartamento', bedrooms: '0' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.bedrooms).toBeUndefined()
  })

  it('exige título y descripción con un mínimo de contenido', () => {
    // Arrange
    const values = buildPublicationValues({ title: 'Casa', description: 'Bonita.' })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.title).toBe('El título debe tener al menos 10 caracteres.')
    expect(errors.description).toBe('Cuenta un poco más: al menos 30 caracteres.')
  })

  it('limita el largo del título', () => {
    // Arrange
    const values = buildPublicationValues({ title: 'a'.repeat(81) })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.title).toBe('El título no puede pasar de 80 caracteres.')
  })

  it('exige un precio mayor que cero', () => {
    // Arrange
    const empty = buildPublicationValues({ price: '' })
    const zero = buildPublicationValues({ price: '0' })

    // Act
    const emptyErrors = validatePublication(empty)
    const zeroErrors = validatePublication(zero)

    // Assert
    expect(emptyErrors.price).toBe('Indica el precio.')
    expect(zeroErrors.price).toBe('El precio debe ser mayor que 0.')
  })

  it('exige al menos una foto', () => {
    // Arrange
    const values = buildPublicationValues({ images: [] })

    // Act
    const errors = validatePublication(values)

    // Assert
    expect(errors.images).toBe('Agrega al menos una foto.')
  })
})
