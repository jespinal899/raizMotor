import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanFeatures from '@/features/shop/components/PlanFeatures'

describe('PlanFeatures', () => {
  it('lista lo que incluye el plan, en el orden recibido', () => {
    // Arrange
    const features = [
      { text: 'Hasta 25 propiedades activas', emphasized: 'Hasta 25 propiedades' },
      { text: '1 usuario por agente inmobiliario', emphasized: '1 usuario' },
      { text: 'Panel de administración de cartera' },
    ]

    // Act
    render(<PlanFeatures features={features} />)

    // Assert
    const items = screen.getAllByRole('listitem').map((item) => item.textContent?.replace(/\s+/g, ' ').trim())
    expect(items).toEqual(features.map(({ text }) => text))
    expect(screen.getByText('Hasta 25 propiedades').tagName).toBe('STRONG')
    expect(screen.getByText('1 usuario').tagName).toBe('STRONG')
  })
})
