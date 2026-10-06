import { describe, expect, it } from 'vitest'
import type { ReportFormValues } from '@/features/properties/types/report.types'
import { MAX_REPORT_DETAILS_LENGTH, validateReport } from '@/features/properties/utils/reportValidation'

const buildReport = (overrides: Partial<ReportFormValues> = {}): ReportFormValues => ({
  reason: 'fraud',
  details: '',
  ...overrides,
})

describe('validateReport', () => {
  it('acepta un reporte con su motivo, aunque no lleve comentario', () => {
    // Arrange
    const values = buildReport()

    // Act
    const errors = validateReport(values)

    // Assert
    expect(errors).toEqual({ reason: undefined, details: undefined })
  })

  it('pide elegir un motivo', () => {
    // Arrange
    const values = buildReport({ reason: '' })

    // Act
    const errors = validateReport(values)

    // Assert
    expect(errors.reason).toBe('Elige un motivo.')
  })

  it('no acepta un motivo que no esté en la lista, aunque se llame como algo que todo objeto trae', () => {
    // Arrange
    const values = buildReport({ reason: 'constructor' as ReportFormValues['reason'] })

    // Act
    const errors = validateReport(values)

    // Assert
    expect(errors.reason).toBe('Elige un motivo.')
  })

  it('con "Otro motivo" pide contar cuál es: es lo único que dice qué pasa', () => {
    // Arrange
    const values = buildReport({ reason: 'other', details: '   ' })

    // Act
    const errors = validateReport(values)

    // Assert
    expect(errors.details).toBe('Cuéntanos cuál es el motivo.')
  })

  it('con "Otro motivo" y su explicación, lo acepta', () => {
    // Arrange
    const values = buildReport({ reason: 'other', details: 'El anuncio está repetido.' })

    // Act
    const errors = validateReport(values)

    // Assert
    expect(errors.details).toBeUndefined()
  })

  it('acepta un comentario justo en el límite de largo y rechaza el que lo pasa', () => {
    // Arrange
    const atLimit = 'a'.repeat(MAX_REPORT_DETAILS_LENGTH)
    const overLimit = `${atLimit}a`

    // Act
    const errors = [validateReport(buildReport({ details: atLimit })), validateReport(buildReport({ details: overLimit }))]

    // Assert
    expect(errors[0].details).toBeUndefined()
    expect(errors[1].details).toBe(`El comentario no puede pasar de ${MAX_REPORT_DETAILS_LENGTH} caracteres.`)
  })
})
