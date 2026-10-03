import { describe, expect, it } from 'vitest'
import { normalizeText } from '@/shared/utils/text'

describe('normalizeText', () => {
  it('quita tildes, mayúsculas y espacios de los extremos', () => {
    // Arrange
    const text = '  Víctor LARCO  '

    // Act
    const normalized = normalizeText(text)

    // Assert
    expect(normalized).toBe('victor larco')
  })

  it('conserva la eñe como letra base sin virgulilla', () => {
    // Arrange
    const text = 'Ñaña'

    // Act
    const normalized = normalizeText(text)

    // Assert
    expect(normalized).toBe('nana')
  })
})
