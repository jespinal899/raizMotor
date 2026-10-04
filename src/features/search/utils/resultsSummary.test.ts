import { describe, expect, it } from 'vitest'
import { formatResultsSummary } from '@/features/search/utils/resultsSummary'

describe('formatResultsSummary', () => {
  it('usa el singular cuando hay un único resultado', () => {
    // Arrange
    const results = { total: 1, page: 1, pageSize: 6, count: 1 }

    // Act
    const summary = formatResultsSummary(results)

    // Assert
    expect(summary).toBe('1 propiedad encontrada')
  })

  it('muestra el total cuando todo cabe en una página', () => {
    // Arrange
    const results = { total: 4, page: 1, pageSize: 6, count: 4 }

    // Act
    const summary = formatResultsSummary(results)

    // Assert
    expect(summary).toBe('4 propiedades encontradas')
  })

  it('no menciona el tramo cuando el total coincide justo con el tamaño de página', () => {
    // Arrange
    const results = { total: 6, page: 1, pageSize: 6, count: 6 }

    // Act
    const summary = formatResultsSummary(results)

    // Assert
    expect(summary).toBe('6 propiedades encontradas')
  })

  it('indica el tramo de la primera página cuando hay varias', () => {
    // Arrange
    const results = { total: 11, page: 1, pageSize: 6, count: 6 }

    // Act
    const summary = formatResultsSummary(results)

    // Assert
    expect(summary).toBe('Mostrando 1–6 de 11 propiedades')
  })

  it('en la última página el tramo termina en el total', () => {
    // Arrange
    const results = { total: 11, page: 2, pageSize: 6, count: 5 }

    // Act
    const summary = formatResultsSummary(results)

    // Assert
    expect(summary).toBe('Mostrando 7–11 de 11 propiedades')
  })
})
