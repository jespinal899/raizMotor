import { describe, expect, it } from 'vitest'
import { showSampleListings } from '@/features/properties/utils/sampleListings'

describe('showSampleListings', () => {
  it('sin anuncios compartidos muestra los ejemplos: son lo único que enseña el sitio', () => {
    // Arrange
    const env = {}

    // Act
    const shown = showSampleListings(false, env)

    // Assert
    expect(shown).toBe(true)
  })

  it('con anuncios compartidos no los mezcla con los reales', () => {
    // Arrange
    const env = {}

    // Act
    const shown = showSampleListings(true, env)

    // Assert
    expect(shown).toBe(false)
  })

  it('con anuncios compartidos los muestra si la compilación lo pide', () => {
    // Arrange
    const env = { VITE_SHOW_SAMPLE_LISTINGS: ' true\n' }

    // Act
    const shown = showSampleListings(true, env)

    // Assert
    expect(shown).toBe(true)
  })

  it.each(['', 'false', 'sí', '1'])('con anuncios compartidos, %j no cuenta como pedirlo', (value) => {
    // Arrange
    const env = { VITE_SHOW_SAMPLE_LISTINGS: value }

    // Act
    const shown = showSampleListings(true, env)

    // Assert
    expect(shown).toBe(false)
  })
})
