import { describe, expect, it } from 'vitest'
import {
  HONDURAS_DIAL_CODE,
  formatInternationalPhone,
  formatLocalPhone,
  honduranPhone,
  toInternationalPhone,
} from '@/shared/utils/honduranPhone'

describe('formatLocalPhone', () => {
  it.each([
    { typed: '', shown: '' },
    { typed: '9', shown: '9' },
    { typed: '9999', shown: '9999' },
    { typed: '99998', shown: '9999-8' },
    { typed: '99998888', shown: '9999-8888' },
  ])('mientras se escribe "$typed" muestra "$shown", con el guion tras el cuarto dígito', ({ typed, shown }) => {
    // Arrange: texto tal como va quedando en el campo

    // Act
    const formatted = formatLocalPhone(typed)

    // Assert
    expect(formatted).toBe(shown)
  })

  it('solo deja pasar dígitos: descarta letras, espacios y símbolos', () => {
    // Arrange
    const typed = ' 99a99-88 x88.'

    // Act
    const formatted = formatLocalPhone(typed)

    // Assert
    expect(formatted).toBe('9999-8888')
  })

  it('no admite más dígitos de los que tiene un número del país', () => {
    // Arrange
    const typed = '9999888877'

    // Act
    const formatted = formatLocalPhone(typed)

    // Assert
    expect(formatted).toBe('9999-8888')
  })

  it.each(['+504 9999-8888', '50499998888', '+50499998888'])(
    'si se pega el número completo "%s", se queda con la parte local: el prefijo ya está puesto',
    (pasted) => {
      // Arrange: número copiado de otro sitio, con el prefijo del país

      // Act
      const formatted = formatLocalPhone(pasted)

      // Assert
      expect(formatted).toBe('9999-8888')
    },
  )
})

describe('toInternationalPhone', () => {
  it('une el prefijo del país y el número local, sin separadores', () => {
    // Arrange
    const local = '9999-8888'

    // Act
    const international = toInternationalPhone(local)

    // Assert
    expect(international).toBe('+50499998888')
    expect(international.startsWith(HONDURAS_DIAL_CODE)).toBe(true)
  })

  it('no repite el prefijo si el número ya lo traía', () => {
    // Arrange
    const withDialCode = '+504 9999-8888'

    // Act
    const international = toInternationalPhone(withDialCode)

    // Assert
    expect(international).toBe('+50499998888')
  })
})

describe('honduranPhone', () => {
  it.each(['2234-5678', '3345-6789', '7234-5678', '8915-0271', '9999-8888'])(
    'acepta "%s": tiene 8 dígitos y empieza como un número del país',
    (local) => {
      // Arrange: número fijo (2) o móvil (3, 7, 8, 9)

      // Act
      const error = honduranPhone(local)

      // Assert
      expect(error).toBeUndefined()
    },
  )

  it.each(['9', '9999-888', ''])('avisa de que a "%s" le faltan dígitos', (local) => {
    // Arrange: número a medio escribir

    // Act
    const error = honduranPhone(local)

    // Assert
    expect(error).toBe('Escribe los 8 dígitos de tu número.')
  })

  it.each(['1234-5678', '4234-5678', '5234-5678', '6234-5678', '0234-5678'])(
    'rechaza "%s": en Honduras ningún número empieza así',
    (local) => {
      // Arrange: 8 dígitos, pero con un primer dígito que el país no usa

      // Act
      const error = honduranPhone(local)

      // Assert
      expect(error).toBe('Revisa el número: en Honduras empiezan por 2, 3, 7, 8 o 9.')
    },
  )
})

describe('formatInternationalPhone', () => {
  it('muestra un número completo como se lee: el prefijo del país y el número en sus dos grupos', () => {
    // Arrange
    const international = '+50499999999'

    // Act
    const formatted = formatInternationalPhone(international)

    // Assert
    expect(formatted).toBe('+504 9999-9999')
  })
})
