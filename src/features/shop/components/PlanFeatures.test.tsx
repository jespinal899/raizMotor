import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanFeatures from '@/features/shop/components/PlanFeatures'

describe('PlanFeatures', () => {
  it('lista lo que incluye el plan, en el orden recibido', () => {
    // Arrange
    const features = ['Publica hasta 25 propiedades', '1 usuario por agente inmobiliario']

    // Act
    render(<PlanFeatures features={features} />)

    // Assert
    const items = screen.getAllByRole('listitem').map((item) => item.textContent)
    expect(items).toEqual(features)
  })
})
