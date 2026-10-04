import { describe, expect, it } from 'vitest'
import { buildPageRange, paginate } from '@/shared/utils/pagination'

const ELEVEN_ITEMS = Array.from({ length: 11 }, (_, position) => position + 1)

describe('paginate', () => {
  it('devuelve los elementos de la primera página y los totales', () => {
    // Arrange
    const request = { page: 1, pageSize: 6 }

    // Act
    const result = paginate(ELEVEN_ITEMS, request)

    // Assert
    expect(result).toEqual({ items: [1, 2, 3, 4, 5, 6], total: 11, page: 1, pageSize: 6, totalPages: 2 })
  })

  it('devuelve el resto en la última página', () => {
    // Arrange
    const request = { page: 2, pageSize: 6 }

    // Act
    const result = paginate(ELEVEN_ITEMS, request)

    // Assert
    expect(result.items).toEqual([7, 8, 9, 10, 11])
    expect(result.page).toBe(2)
  })

  it('calcula el máximo de páginas según la cantidad de elementos', () => {
    // Arrange
    const sizes = [5, 6, 11, 12]

    // Act
    const totalPages = sizes.map((pageSize) => paginate(ELEVEN_ITEMS, { page: 1, pageSize }).totalPages)

    // Assert
    expect(totalPages).toEqual([3, 2, 1, 1])
  })

  it('ajusta a la última página una página mayor que el máximo', () => {
    // Arrange
    const request = { page: 99, pageSize: 6 }

    // Act
    const result = paginate(ELEVEN_ITEMS, request)

    // Assert
    expect(result.page).toBe(2)
    expect(result.items).toEqual([7, 8, 9, 10, 11])
  })

  it.each([0, -3, Number.NaN, 1.7])('trata la página %s como la primera', (page) => {
    // Arrange
    const request = { page, pageSize: 6 }

    // Act
    const result = paginate(ELEVEN_ITEMS, request)

    // Assert
    expect(result.page).toBe(1)
  })

  it('sin elementos devuelve una única página vacía', () => {
    // Arrange
    const noItems: number[] = []

    // Act
    const result = paginate(noItems, { page: 3, pageSize: 6 })

    // Assert
    expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 6, totalPages: 1 })
  })

  it('no modifica la lista original', () => {
    // Arrange
    const original = [...ELEVEN_ITEMS]

    // Act
    paginate(original, { page: 2, pageSize: 4 })

    // Assert
    expect(original).toEqual(ELEVEN_ITEMS)
  })
})

describe('buildPageRange', () => {
  it('muestra todas las páginas, del 1 al máximo, cuando son pocas', () => {
    // Arrange
    const totalPages = 5

    // Act
    const range = buildPageRange(1, totalPages)

    // Assert
    expect(range).toEqual([1, 2, 3, 4, 5])
  })

  it('devuelve una sola página cuando todo cabe en una', () => {
    // Arrange
    const totalPages = 1

    // Act
    const range = buildPageRange(1, totalPages)

    // Assert
    expect(range).toEqual([1])
  })

  it('con muchas páginas resume el final cuando se está al principio', () => {
    // Arrange
    const currentPage = 1

    // Act
    const range = buildPageRange(currentPage, 20)

    // Assert
    expect(range).toEqual([1, 2, 'ellipsis-end', 20])
  })

  it('con muchas páginas resume ambos lados cuando se está en medio', () => {
    // Arrange
    const currentPage = 10

    // Act
    const range = buildPageRange(currentPage, 20)

    // Assert
    expect(range).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20])
  })

  it('con muchas páginas resume el principio cuando se está al final', () => {
    // Arrange
    const currentPage = 20

    // Act
    const range = buildPageRange(currentPage, 20)

    // Assert
    expect(range).toEqual([1, 'ellipsis-start', 19, 20])
  })

  it('muestra el número en lugar de puntos suspensivos cuando solo falta uno', () => {
    // Arrange: entre la página 1 y la 3 solo falta la 2
    const currentPage = 4

    // Act
    const range = buildPageRange(currentPage, 20)

    // Assert
    expect(range).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20])
  })

  it('incluye siempre la primera y la última página', () => {
    // Arrange
    const totalPages = 50

    // Act
    const ranges = [1, 25, 50].map((currentPage) => buildPageRange(currentPage, totalPages))

    // Assert
    ranges.forEach((range) => {
      expect(range[0]).toBe(1)
      expect(range.at(-1)).toBe(totalPages)
    })
  })
})
