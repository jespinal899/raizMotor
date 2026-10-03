import { describe, expect, it } from 'vitest'
import {
  findPropertyTypeBySlug,
  isPropertyOperation,
  isPropertyType,
} from '@/features/properties/utils/propertyGuards'

describe('isPropertyOperation', () => {
  it('reconoce una operación válida', () => {
    // Arrange
    const value = 'alquiler'

    // Act
    const result = isPropertyOperation(value)

    // Assert
    expect(result).toBe(true)
  })

  it.each(['constructor', 'toString', 'hasOwnProperty'])(
    'rechaza "%s", que existe en todo objeto pero no es una operación',
    (inherited) => {
      // Arrange: `inherited` es una clave heredada de Object.prototype

      // Act
      const result = isPropertyOperation(inherited)

      // Assert
      expect(result).toBe(false)
    },
  )

  it('rechaza valores que no son texto', () => {
    // Arrange
    const value = null

    // Act
    const result = isPropertyOperation(value)

    // Assert
    expect(result).toBe(false)
  })
})

describe('isPropertyType', () => {
  it('rechaza el valor "todos" del desplegable', () => {
    // Arrange
    const value = 'todos'

    // Act
    const result = isPropertyType(value)

    // Assert
    expect(result).toBe(false)
  })
})

describe('findPropertyTypeBySlug', () => {
  it('convierte el segmento de la URL en el tipo de propiedad', () => {
    // Arrange
    const slug = 'apartamentos'

    // Act
    const type = findPropertyTypeBySlug(slug)

    // Assert
    expect(type).toBe('apartamento')
  })

  it('devuelve undefined para un segmento desconocido', () => {
    // Arrange
    const slug = 'castillos'

    // Act
    const type = findPropertyTypeBySlug(slug)

    // Assert
    expect(type).toBeUndefined()
  })
})
