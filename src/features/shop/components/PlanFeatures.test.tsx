import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanFeatures from '@/features/shop/components/PlanFeatures'

const FEATURES = [
  { text: 'Hasta 25 propiedades activas', emphasized: 'Hasta 25 propiedades' },
  { text: '1 usuario por agente inmobiliario', emphasized: '1 usuario' },
  { text: 'Panel de administración de cartera' },
]

describe('PlanFeatures', () => {
  it('lista lo que incluye el plan, en el orden recibido', () => {
    // Arrange
    const features = FEATURES

    // Act
    render(<PlanFeatures features={features} />)

    // Assert
    const items = screen.getAllByRole('listitem').map((item) => item.textContent?.replace(/\s+/g, ' ').trim())
    expect(items).toEqual(features.map(({ text }) => text))
    expect(screen.getByText('Hasta 25 propiedades').tagName).toBe('STRONG')
    expect(screen.getByText('1 usuario').tagName).toBe('STRONG')
  })

  it('cada punto va en un solo bloque de texto: la negrita y el resto se leen como una frase, con su espacio normal', () => {
    // Arrange
    const features = FEATURES

    // Act
    render(<PlanFeatures features={features} />)

    // Assert: junto a la marca de verificación hay un único elemento, y contiene el texto entero
    const blocks = screen.getAllByRole('listitem').map((item) => item.querySelectorAll(':scope > :not(svg)'))
    expect(blocks.map((block) => block.length)).toEqual([1, 1, 1])
    expect(blocks.map((block) => block[0].textContent)).toEqual(features.map(({ text }) => text))
  })

  it('si el tramo a destacar no forma parte del texto, muestra el texto sin negrita', () => {
    // Arrange
    const features = [{ text: 'Hasta 25 propiedades activas', emphasized: 'Hasta 100 propiedades' }]

    // Act
    render(<PlanFeatures features={features} />)

    // Assert
    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Hasta 25 propiedades activas')
    expect(item.querySelector('strong')).toBeNull()
  })
})
