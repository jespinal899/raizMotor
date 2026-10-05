import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TextDivider from '@/components/TextDivider'

describe('TextDivider', () => {
  it('muestra la palabra que separa las dos alternativas', () => {
    // Arrange
    const word = 'o'

    // Act
    render(<TextDivider>{word}</TextDivider>)

    // Assert
    expect(screen.getByText(word)).toBeInTheDocument()
  })

  it('es HTML válido: las líneas son bloques y un párrafo no puede contenerlos', () => {
    // Arrange: separador entre dos formas de entrar

    // Act
    const { container } = render(<TextDivider>o</TextDivider>)

    // Assert
    const lines = [...container.querySelectorAll('[data-slot="separator"]')]
    expect(lines.filter((line) => line.closest('p'))).toEqual([])
  })

  it('las líneas de los lados son un adorno: los lectores de pantalla solo leen la palabra', () => {
    // Arrange: separador entre dos formas de entrar

    // Act
    const { container } = render(<TextDivider>o</TextDivider>)

    // Assert
    const lines = [...container.querySelectorAll('[data-slot="separator"]')]
    expect(lines).toHaveLength(2)
    expect(lines.every((line) => line.getAttribute('aria-hidden') === 'true')).toBe(true)
  })
})
