import { describe, expect, it } from 'vitest'
import {
  ANY_OPTION,
  TYPE_OPTIONS,
  getMaxPriceOptions,
  toOptionValue,
} from '@/features/search/utils/searchOptions'

describe('TYPE_OPTIONS', () => {
  it('empieza con la opción "todos" seguida de cada tipo en plural', () => {
    // Arrange
    const expectedLabels = ['Todos los tipos', 'Casas', 'Apartamentos', 'Terrenos']

    // Act
    const labels = TYPE_OPTIONS.map((option) => option.label)

    // Assert
    expect(labels).toEqual(expectedLabels)
    expect(TYPE_OPTIONS[0].value).toBe(ANY_OPTION)
  })
})

describe('getMaxPriceOptions', () => {
  it('ofrece la escala de alquiler cuando la operación es alquiler', () => {
    // Arrange
    const operation = 'alquiler'

    // Act
    const values = getMaxPriceOptions(operation).map((option) => option.value)

    // Assert
    expect(values).toEqual([ANY_OPTION, '700', '1000', '1500', '2500'])
  })

  it('usa la escala de venta cuando no hay operación elegida', () => {
    // Arrange
    const operation = undefined

    // Act
    const options = getMaxPriceOptions(operation)

    // Assert
    expect(options).toEqual(getMaxPriceOptions('venta'))
  })

  it('rotula cada precio como "Hasta …" y el primero como sin límite', () => {
    // Arrange
    const operation = 'venta'

    // Act
    const labels = getMaxPriceOptions(operation).map((option) => option.label.replace(/\s/g, ' '))

    // Assert
    expect(labels[0]).toBe('Sin límite')
    expect(labels[1]).toBe('Hasta $ 100,000')
  })
})

describe('toOptionValue', () => {
  it('devuelve el valor cuando está entre las opciones', () => {
    // Arrange
    const options = getMaxPriceOptions('venta')

    // Act
    const value = toOptionValue(options, 200000)

    // Assert
    expect(value).toBe('200000')
  })

  it('devuelve "todos" cuando el valor no está entre las opciones', () => {
    // Arrange
    const options = getMaxPriceOptions('alquiler')

    // Act
    const value = toOptionValue(options, 200000)

    // Assert
    expect(value).toBe(ANY_OPTION)
  })

  it('devuelve "todos" cuando no hay valor seleccionado', () => {
    // Arrange
    const selected = undefined

    // Act
    const value = toOptionValue(TYPE_OPTIONS, selected)

    // Assert
    expect(value).toBe(ANY_OPTION)
  })
})
