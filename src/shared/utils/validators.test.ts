import { describe, expect, it } from 'vitest'
import { email, minLength, optional, phone, required, validate } from '@/shared/utils/validators'

describe('required', () => {
  it('acepta un valor con texto', () => {
    // Arrange
    const validator = required('Campo obligatorio')

    // Act
    const error = validator('Jorge')

    // Assert
    expect(error).toBeUndefined()
  })

  it.each(['', '   ', '\n\t'])('rechaza el valor vacío o en blanco %j', (blank) => {
    // Arrange
    const validator = required('Campo obligatorio')

    // Act
    const error = validator(blank)

    // Assert
    expect(error).toBe('Campo obligatorio')
  })
})

describe('minLength', () => {
  it('acepta un valor con exactamente la longitud mínima', () => {
    // Arrange
    const validator = minLength(3, 'Muy corto')

    // Act
    const error = validator('abc')

    // Assert
    expect(error).toBeUndefined()
  })

  it('rechaza un valor más corto, sin contar los espacios de los extremos', () => {
    // Arrange
    const validator = minLength(3, 'Muy corto')

    // Act
    const error = validator('  ab  ')

    // Assert
    expect(error).toBe('Muy corto')
  })
})

describe('email', () => {
  it.each(['ana@gmail.com', '  ana.perez+casas@correo.com.pe  '])('acepta el correo %j', (address) => {
    // Arrange
    const validator = email('Correo inválido')

    // Act
    const error = validator(address)

    // Assert
    expect(error).toBeUndefined()
  })

  it.each(['ana', 'ana@', '@gmail.com', 'ana@gmail', 'ana perez@gmail.com'])('rechaza el correo %j', (address) => {
    // Arrange
    const validator = email('Correo inválido')

    // Act
    const error = validator(address)

    // Assert
    expect(error).toBe('Correo inválido')
  })
})

describe('phone', () => {
  it.each(['89150271', '+504 8915-0271', '(504) 8915 0271'])('acepta el teléfono %j', (number) => {
    // Arrange
    const validator = phone('Teléfono inválido')

    // Act
    const error = validator(number)

    // Assert
    expect(error).toBeUndefined()
  })

  it.each(['1234567', '1234567890123456', '8915-ABCD', 'llámame'])('rechaza el teléfono %j', (number) => {
    // Arrange
    const validator = phone('Teléfono inválido')

    // Act
    const error = validator(number)

    // Assert
    expect(error).toBe('Teléfono inválido')
  })
})

describe('optional', () => {
  it('acepta un valor vacío sin aplicar el validador', () => {
    // Arrange
    const validator = optional(phone('Teléfono inválido'))

    // Act
    const error = validator('   ')

    // Assert
    expect(error).toBeUndefined()
  })

  it('aplica el validador cuando hay valor', () => {
    // Arrange
    const validator = optional(phone('Teléfono inválido'))

    // Act
    const error = validator('123')

    // Assert
    expect(error).toBe('Teléfono inválido')
  })
})

describe('validate', () => {
  it('devuelve el primer error en el orden de los validadores', () => {
    // Arrange
    const validators = [required('Obligatorio'), minLength(5, 'Muy corto')]

    // Act
    const emptyError = validate('', validators)
    const shortError = validate('abc', validators)

    // Assert
    expect(emptyError).toBe('Obligatorio')
    expect(shortError).toBe('Muy corto')
  })

  it('no devuelve error cuando todos los validadores pasan', () => {
    // Arrange
    const validators = [required('Obligatorio'), minLength(5, 'Muy corto')]

    // Act
    const error = validate('suficiente', validators)

    // Assert
    expect(error).toBeUndefined()
  })
})
