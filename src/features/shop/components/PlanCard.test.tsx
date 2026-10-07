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
    const plan = buildPlan({ action: { label: 'Quiero saber más', to: '/contacto?plan=agente' } })

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(screen.getByRole('link', { name: 'Quiero saber más' })).toHaveAttribute('href', '/contacto?plan=agente')
  })

  it('marca como recomendado solo el plan destacado', () => {
    // Arrange
    const highlighted = buildPlan({ highlighted: true })
    const regular = buildPlan({ id: 'propietario', name: 'Propietario', highlighted: false })

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

  it('un plan que aún no está definido dice "Próximamente" y que se está preparando, sin lista de ventajas', () => {
    // Arrange
    const plan = buildPlan({ price: { kind: 'upcoming' }, features: [] })

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    expect(screen.getByText('Estamos definiendo este plan. Escríbenos y te avisamos cuando esté listo.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('un plan con ventajas no lleva el aviso de que se está preparando', () => {
    // Arrange
    const plan = buildPlan({ price: { kind: 'free' } })

    // Act
    renderWithRouter(<PlanCard plan={plan} />)

    // Assert
    expect(screen.queryByText(/Estamos definiendo este plan/)).not.toBeInTheDocument()
  })
})
