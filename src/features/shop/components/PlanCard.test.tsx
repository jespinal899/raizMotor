import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanCard from '@/features/shop/components/PlanCard'
import type { Plan } from '@/features/shop/types/plan.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const buildPlan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'inmobiliaria',
  name: 'Inmobiliaria',
  audience: 'Para equipos.',
  price: { kind: 'monthly', from: 50 },
  features: ['Hasta 25 propiedades', 'Reportes'],
  action: { label: 'Solicitar este plan', to: '/contacto?plan=inmobiliaria' },
  ...overrides,
})

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('PlanCard', () => {
  it('muestra el nombre, a quién va dirigido y sus ventajas', () => {
    // Arrange
    const plan = buildPlan()

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(screen.getByRole('heading', { name: 'Inmobiliaria' })).toBeInTheDocument()
    expect(screen.getByText('Para equipos.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map(textOf)).toEqual(['Hasta 25 propiedades', 'Reportes'])
  })

  it('muestra el precio mensual como "Desde … / mes"', () => {
    // Arrange
    const plan = buildPlan({ price: { kind: 'monthly', from: 50 } })

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(textOf(screen.getByText(/50/).parentElement as HTMLElement)).toBe('Desde $ 50 / mes')
  })

  it('muestra "Gratis" en un plan sin coste', () => {
    // Arrange
    const plan = buildPlan({ price: { kind: 'free' } })

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(screen.getByText('Gratis')).toBeInTheDocument()
    expect(screen.queryByText('/ mes')).not.toBeInTheDocument()
  })

  it('el botón lleva al destino del plan', () => {
    // Arrange
    const plan = buildPlan({ action: { label: 'Hablar con ventas', to: '/contacto?plan=constructora' } })

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(screen.getByRole('link', { name: 'Hablar con ventas' })).toHaveAttribute('href', '/contacto?plan=constructora')
  })

  it('marca como recomendado solo el plan destacado', () => {
    // Arrange
    const highlighted = buildPlan({ highlighted: true })
    const regular = buildPlan({ id: 'particular', name: 'Particular', highlighted: false })

    // Act
    renderWithRouter(
      <>
        <PlanCard plan={highlighted} />
        <PlanCard plan={regular} />
      </>,
    )

    // Assert
    expect(screen.getAllByText('Recomendado')).toHaveLength(1)
  })
})
