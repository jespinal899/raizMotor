import { describe, expect, it } from 'vitest'
import {
  ANY_OPTION,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  SORT_OPTIONS,
  TYPE_OPTIONS,
  getMaxPriceOptions,
  getMinPriceOptions,
  toOptionValue,
  toOptionalNumber,
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

describe('opciones para afinar la búsqueda', () => {
  it('el precio mínimo ofrece la escala de la operación, empezando por "sin mínimo"', () => {
    // Arrange
    const operation = 'alquiler'

    // Act
    const options = getMinPriceOptions(operation)

    // Assert
    expect(options[0]).toEqual({ value: ANY_OPTION, label: 'Sin mínimo' })
    expect(options.slice(1).map((option) => option.label.replace(/\s/g, ' '))).toEqual([
      'Desde $ 300',
      'Desde $ 500',
      'Desde $ 700',
      'Desde $ 1,000',
    ])
  })

  it('sin operación, el precio mínimo usa la escala de venta, como el máximo', () => {
    // Arrange
    const operation = undefined

    // Act
    const options = getMinPriceOptions(operation)

    // Assert
    expect(options).toEqual(getMinPriceOptions('venta'))
  })

  it('dormitorios y baños se piden como un mínimo: "2 o más"', () => {
    // Arrange: opciones fijas

    // Act
    const labels = [BEDROOM_OPTIONS, BATHROOM_OPTIONS].map((options) => options.map((option) => option.label))

    // Assert
    expect(labels).toEqual([
      ['Cualquiera', '1 o más', '2 o más', '3 o más', '4 o más'],
      ['Cualquiera', '1 o más', '2 o más', '3 o más'],
    ])
  })

  it('el orden ofrece el predeterminado y, después, por precio y por superficie', () => {
    // Arrange: opciones fijas

    // Act
    const options = SORT_OPTIONS

    // Assert
    expect(options).toEqual([
      { value: ANY_OPTION, label: 'Predeterminado' },
      { value: 'price-asc', label: 'Precio: de menor a mayor' },
      { value: 'price-desc', label: 'Precio: de mayor a menor' },
      { value: 'area-desc', label: 'Superficie: de mayor a menor' },
    ])
  })

  it('toOptionalNumber convierte la opción elegida en número y "todos" en ningún filtro', () => {
    // Arrange
    const values = ['3', ANY_OPTION]

    // Act
    const numbers = values.map(toOptionalNumber)

    // Assert
    expect(numbers).toEqual([3, undefined])
  })
})
