import { describe, expect, it } from 'vitest'
import { CONVERSION_NOTE, EXCHANGE_RATE } from '@/shared/constants/currency'

describe('CONVERSION_NOTE', () => {
  it('dice con qué tipo de cambio se convierte y de dónde sale, para que nadie lo tome por un importe exacto', () => {
    // Arrange
    const rate = EXCHANGE_RATE.lempirasPerDollar

    // Act
    const note = CONVERSION_NOTE

    // Assert
    expect(note).toBe(
      `Conversión aproximada: L ${rate} por $ 1, tipo de cambio de referencia del Banco Central de Honduras.`,
    )
  })
})
