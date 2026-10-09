import { describe, expect, it } from 'vitest'
import { fullName, shortName } from '@/features/auth/utils/accountName'
import { buildSessionUser } from '@/test/factories'

describe('shortName', () => {
  it('llama a la persona por su nombre', () => {
    // Arrange
    const user = buildSessionUser({ firstName: 'Ana', lastName: 'Mejía' })

    // Act
    const name = shortName(user)

    // Assert
    expect(name).toBe('Ana')
  })

  it('si la cuenta no guarda el nombre usa el correo, en lugar de inventar uno', () => {
    // Arrange
    const user = buildSessionUser({ firstName: '', email: 'ana@gmail.com' })

    // Act
    const name = shortName(user)

    // Assert
    expect(name).toBe('ana@gmail.com')
  })
})

describe('fullName', () => {
  it.each([
    { firstName: 'Ana', lastName: 'Mejía', expected: 'Ana Mejía', when: 'tiene nombre y apellido' },
    { firstName: 'Ana', lastName: '', expected: 'Ana', when: 'solo tiene nombre' },
    { firstName: '', lastName: '', expected: 'ana@gmail.com', when: 'la cuenta no guarda ninguno' },
  ])('es "$expected" cuando $when', ({ firstName, lastName, expected }) => {
    // Arrange
    const user = buildSessionUser({ firstName, lastName, email: 'ana@gmail.com' })

    // Act
    const name = fullName(user)

    // Assert
    expect(name).toBe(expected)
  })
})
