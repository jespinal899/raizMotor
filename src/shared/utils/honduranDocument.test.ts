import { describe, expect, it } from 'vitest'
import { describeDocument, honduranDocument, toDocumentDigits } from '@/shared/utils/honduranDocument'

describe('toDocumentDigits', () => {
  it('se queda solo con los dígitos, se escriba con guiones o con espacios', () => {
    // Arrange
    const written = ' 0801-1990-12345 '

    // Act
    const digits = toDocumentDigits(written)

    // Assert
    expect(digits).toBe('0801199012345')
  })
})

describe('honduranDocument', () => {
  it.each([
    { document: '0801199012345', kind: 'un DNI de 13 dígitos' },
    { document: '0801-1990-12345', kind: 'un DNI escrito con guiones' },
    { document: '08011990123456', kind: 'un RTN de 14 dígitos' },
  ])('acepta $kind', ({ document }) => {
    // Arrange: documento con la forma correcta

    // Act
    const error = honduranDocument(document)

    // Assert
    expect(error).toBeUndefined()
  })

  it.each([
    { document: '0801-1990', reason: 'le faltan dígitos' },
    { document: '080119901234567', reason: 'le sobran dígitos' },
    { document: 'no lo sé', reason: 'no lleva dígitos' },
  ])('rechaza un documento al que $reason', ({ document }) => {
    // Arrange: documento mal escrito

    // Act
    const error = honduranDocument(document)

    // Assert
    expect(error).toBe('Escribe los 13 dígitos del DNI o los 14 del RTN.')
  })
})

describe('describeDocument', () => {
  it.each([
    { digits: '0801199012345', expected: 'DNI 0801199012345' },
    { digits: '08011990123456', expected: 'RTN 08011990123456' },
  ])('nombra el documento por su largo: $expected', ({ digits, expected }) => {
    // Arrange: documento ya reducido a sus dígitos

    // Act
    const described = describeDocument(digits)

    // Assert
    expect(described).toBe(expected)
  })
})
