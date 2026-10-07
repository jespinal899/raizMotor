import { screen } from '@testing-library/react'
import { House } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import PlanCard from '@/features/shop/components/PlanCard'
import type { PlanAction } from '@/features/shop/types/plan.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const ACTION: PlanAction = { label: 'Publicar como propietario', to: '/publicar' }

const setup = (action: PlanAction = ACTION, accented = false) =>
  renderWithRouter(
    <PlanCard name="Propietario" action={action} accented={accented}>
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

  it('muestra el título del plan en azul', () => {
    // Arrange: tarjeta de un plan

    // Act
    setup(ACTION, true)

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: 'Propietario' })).toHaveClass('text-primary')
  })

  it('el botón lleva al destino del plan', () => {
    // Arrange
    const action = { label: 'Contratar', to: '/contacto?plan=agente-plan-1' }

    // Act
    setup(action)

    // Assert
    expect(screen.getByRole('link', { name: 'Contratar' })).toHaveAttribute('href', '/contacto?plan=agente-plan-1')
  })

  it('el botón resaltado usa fondo azul y texto blanco', () => {
    // Arrange: tarjeta de un plan

    // Act
    setup(ACTION, true)

    // Assert
    const button = screen.getByRole('link', { name: ACTION.label })
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(button).not.toHaveClass('bg-transparent', 'text-primary')
    expect(screen.queryByText('Recomendado')).not.toBeInTheDocument()
  })

  it('conserva el estilo normal en los planes que no solicitan el acento azul', () => {
    // Arrange: tarjeta de un plan secundario

    // Act
    setup()

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: 'Propietario' })).not.toHaveClass('text-primary')
    expect(screen.getByRole('link', { name: ACTION.label })).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('si la acción trae un icono, lo muestra como adorno junto al texto, sin cambiar el nombre del enlace', () => {
    // Arrange
    const action = { ...ACTION, icon: House }

    // Act
    setup(action)

    // Assert
    const icon = screen.getByRole('link', { name: ACTION.label }).querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('sin icono en la acción, el botón lleva solo el texto', () => {
    // Arrange: acción sin icono, como la de "Contratar"

    // Act
    setup()

    // Assert
    expect(screen.getByRole('link', { name: ACTION.label }).querySelector('svg')).toBeNull()
  })

  it('solo la tarjeta resaltada eleva el botón al pasar el cursor', () => {
    // Arrange: tarjeta sin el acento

    // Act
    setup()

    // Assert
    const button = screen.getByRole('link', { name: ACTION.label })
    expect(button).not.toHaveClass('hover:-translate-y-0.5')
    expect(button).not.toHaveClass('hover:shadow-md')
  })
})
