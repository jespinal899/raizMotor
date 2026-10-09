import { describe, expect, it } from 'vitest'
import { normalizeText, toParagraphs } from '@/shared/utils/text'

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

describe('toParagraphs', () => {
  it.each([
    {
      when: 'separa los párrafos por la línea en blanco que los divide',
      text: 'Casa de dos plantas.\n\nQueda cerca del parque.',
      expected: ['Casa de dos plantas.', 'Queda cerca del parque.'],
    },
    {
      when: 'varias líneas en blanco seguidas separan lo mismo que una',
      text: 'Casa de dos plantas.\n\n\n\n\nQueda cerca del parque.',
      expected: ['Casa de dos plantas.', 'Queda cerca del parque.'],
    },
    {
      when: 'una línea que solo tiene espacios también es una línea en blanco',
      text: 'Casa de dos plantas.\n   \nQueda cerca del parque.',
      expected: ['Casa de dos plantas.', 'Queda cerca del parque.'],
    },
    {
      when: 'conserva los saltos de línea de dentro de un párrafo',
      text: 'Incluye:\n- Cocina equipada\n- Patio\n\nPrecio negociable.',
      expected: ['Incluye:\n- Cocina equipada\n- Patio', 'Precio negociable.'],
    },
    {
      when: 'entiende los saltos de línea de Windows',
      text: 'Incluye:\r\n- Cocina equipada\r\n\r\nPrecio negociable.',
      expected: ['Incluye:\n- Cocina equipada', 'Precio negociable.'],
    },
    {
      when: 'no cuenta los saltos ni los espacios de los extremos',
      text: '\n\n  Casa de dos plantas.  \n\n',
      expected: ['Casa de dos plantas.'],
    },
    {
      when: 'un texto sin líneas en blanco es un solo párrafo',
      text: 'Casa de dos plantas con patio amplio.',
      expected: ['Casa de dos plantas con patio amplio.'],
    },
    { when: 'un texto en blanco no tiene párrafos', text: '  \n\n  ', expected: [] },
  ])('$when', ({ text, expected }) => {
    // Arrange
    const written = text

    // Act
    const paragraphs = toParagraphs(written)

    // Assert
    expect(paragraphs).toEqual(expected)
  })
})
