import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AgentPlanCheckoutPage from '@/features/shop/pages/AgentPlanCheckoutPage'
import { planRequestService } from '@/features/shop/services/planRequestService'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES, agentPlanCheckoutPath } from '@/shared/constants/routes'
import { TRANSFER, checkoutForm, reachConfirmation } from '@/test/checkoutForm'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/shop/services/planRequestService', () => ({ planRequestService: { open: vi.fn() } }))

const open = vi.mocked(planRequestService.open)

const openPage = (planId: string) =>
  renderWithRouter(<AgentPlanCheckoutPage />, { route: agentPlanCheckoutPath(planId), path: ROUTES.agentPlanCheckout })

describe('AgentPlanCheckoutPage', { timeout: 20_000 }, () => {
  beforeEach(() => {
    open.mockReset()
    open.mockReturnValue('https://wa.me/50489150271?text=solicitud')
  })

  it('presenta la contratación del plan indicado en la dirección y pone su título en la pestaña', () => {
    // Arrange
    const planId = 'agente-plan-1'

    // Act
    openPage(planId)

    // Assert
    const title = screen.getByRole('heading', { level: 1, name: 'Contratar Agente Pro' })
    expect(within(title).getByText('Agente Pro')).toHaveClass('text-primary')
    expect(document.title).toBe(`Contratar Agente Pro | ${BRAND.name}`)
  })

  it('abre el formulario por pasos en el primero, el de los datos', async () => {
    // Arrange
    const planId = 'agente-plan-1'

    // Act
    openPage(planId)

    // Assert
    expect(checkoutForm.form()).toBeInTheDocument()
    expect(await checkoutForm.step(1, 'Tus datos')).toBeInTheDocument()
  })

  it('si el plan de la dirección no existe, lo dice y ofrece volver a los planes', () => {
    // Arrange
    const planId = 'inventado'

    // Act
    openPage(planId)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ese plan no existe' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver los planes para agentes' })).toHaveAttribute('href', ROUTES.agentPlans)
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(document.title).toBe(`Ese plan no existe | ${BRAND.name}`)
  })

  it('permite volver a los planes para agentes y preguntar por este plan', () => {
    // Arrange
    const planId = 'agente-plan-1'

    // Act
    openPage(planId)

    // Assert
    expect(screen.getByRole('link', { name: 'Ver los planes para agentes' })).toHaveAttribute('href', ROUTES.agentPlans)
    expect(screen.getByRole('link', { name: 'Escríbenos' })).toHaveAttribute('href', '/contacto?plan=agente-plan-1')
  })

  it('recorrer los tres pasos y enviar abre WhatsApp con el plan de la página', async () => {
    // Arrange
    const user = userEvent.setup()
    openPage('agente-plan-2')
    await reachConfirmation(user, { method: TRANSFER })
    await user.click(checkoutForm.terms())

    // Act
    await user.click(checkoutForm.send())

    // Assert
    expect(open).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: 'agente-plan-2', name: 'Agente Élite' }),
      expect.objectContaining({ firstName: 'Ana', lastName: 'Mejía', paymentMethod: 'transferencia' }),
    )
  })
})
