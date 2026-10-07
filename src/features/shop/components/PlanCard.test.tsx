import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanCard from '@/features/shop/components/PlanCard'
import type { PlanAction } from '@/features/shop/types/plan.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const ACTION: PlanAction = { label: 'Publicar como propietario', to: '/publicar' }

const setup = (action: PlanAction = ACTION) =>
  renderWithRouter(
    <PlanCard name="Propietario" action={action}>
      <p>Vende o arrienda rápido.</p>
    </PlanCard>,
  )

describe('PlanCard', () => {
  it('muestra el nombre del plan como encabezado y, debajo, su contenido', () => {
    // Arrange: tarjeta de un plan con un texto

    // Act
    setup()

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: 'Propietario' })).toBeInTheDocument()
    expect(screen.getByText('Vende o arrienda rápido.')).toBeInTheDocument()
  })

  it('el botón lleva al destino del plan', () => {
    // Arrange
    const action = { label: 'Contratar', to: '/contacto?plan=agente-plan-1' }

    // Act
    setup(action)

    // Assert
    expect(screen.getByRole('link', { name: 'Contratar' })).toHaveAttribute('href', '/contacto?plan=agente-plan-1')
  })

  it('el botón lleva el estilo principal: todos los planes se ofrecen igual, sin destacar ninguno', () => {
    // Arrange: tarjeta de un plan

    // Act
    setup()

    // Assert
    expect(screen.getByRole('link', { name: ACTION.label })).toHaveClass('bg-primary')
    expect(screen.queryByText('Recomendado')).not.toBeInTheDocument()
  })
})
