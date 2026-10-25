import { screen } from '@testing-library/react'
import { House } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '@/features/auth/services/authService'
import PlanCard from '@/features/shop/components/PlanCard'
import type { PlanAction } from '@/features/shop/types/plan.types'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

/** Si la compilación conoce el servicio de cuentas: cada prueba puede cambiarlo. */
const accounts = vi.hoisted(() => ({ available: true }))

vi.mock('@/features/auth/services/authService', () => ({
  get ACCOUNTS_AVAILABLE() {
    return accounts.available
  },
  authService: { onSessionChange: vi.fn() },
}))

const ACTION: PlanAction = { label: 'Publicar como propietario', to: '/publicar' }

const setup = (action: PlanAction = ACTION, accented = false) =>
  renderWithRouter(
    <PlanCard name="Propietario" action={action} accented={accented}>
      <p>Vende o arrienda rápido.</p>
    </PlanCard>,
  )

const CHECKOUT: PlanAction = {
  label: 'Comenzar con Pro',
  to: '/planes/agente-inmobiliario/contratar/agente-plan-1',
  requiresAccount: true,
}

describe('PlanCard', () => {
  beforeEach(() => {
    accounts.available = true
    vi.mocked(authService.onSessionChange).mockReset()
  })

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

  it('a quien no ha iniciado sesión, elegir un plan que pide cuenta lo lleva a iniciarla y luego al plan', () => {
    // Arrange
    sessionIs(null)
    const expected = '/iniciar-sesion?volver=%2Fplanes%2Fagente-inmobiliario%2Fcontratar%2Fagente-plan-1'

    // Act
    setup(CHECKOUT)

    // Assert
    expect(screen.getByRole('link', { name: CHECKOUT.label })).toHaveAttribute('href', expected)
  })

  it('a quien tiene la sesión abierta lo lleva directo al plan', () => {
    // Arrange
    sessionIs(buildSessionUser())

    // Act
    setup(CHECKOUT)

    // Assert
    expect(screen.getByRole('link', { name: CHECKOUT.label })).toHaveAttribute('href', CHECKOUT.to)
  })

  it('mientras no se sabe si hay sesión lleva al plan, que también la pide', () => {
    // Arrange: el servicio aún no ha dicho quién tiene la sesión

    // Act
    setup(CHECKOUT)

    // Assert
    expect(screen.getByRole('link', { name: CHECKOUT.label })).toHaveAttribute('href', CHECKOUT.to)
  })

  it('sin el servicio de cuentas lleva al plan: no habría cómo iniciar sesión', () => {
    // Arrange
    accounts.available = false
    sessionIs(null)

    // Act
    setup(CHECKOUT)

    // Assert
    expect(screen.getByRole('link', { name: CHECKOUT.label })).toHaveAttribute('href', CHECKOUT.to)
  })

  it('una acción que no pide cuenta no cambia aunque no haya sesión', () => {
    // Arrange
    sessionIs(null)
    const action = { label: 'Publicar como inmobiliario', to: '/planes/agente-inmobiliario' }

    // Act
    setup(action)

    // Assert
    expect(screen.getByRole('link', { name: action.label })).toHaveAttribute('href', action.to)
  })
})
