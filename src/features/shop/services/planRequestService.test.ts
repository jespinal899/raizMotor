import { afterEach, describe, expect, it, vi } from 'vitest'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { createWhatsAppPlanRequestService, planRequestService } from '@/features/shop/services/planRequestService'
import type { PlanRequest } from '@/features/shop/types/checkout.types'
import { planRequestChatUrl } from '@/features/shop/utils/planRequest'

const [PRO] = AGENT_PLANS
const REQUEST: PlanRequest = {
  firstName: 'Ana',
  lastName: 'Mejía',
  document: '',
  phone: '+50499999999',
  email: 'ana@gmail.com',
  paymentMethod: 'transferencia',
}

describe('createWhatsAppPlanRequestService', () => {
  it('abre el chat con la solicitud ya escrita y devuelve su dirección, por si no llega a abrirse', () => {
    // Arrange
    const openUrl = vi.fn()
    const service = createWhatsAppPlanRequestService(openUrl)

    // Act
    const chatUrl = service.open(PRO, REQUEST)

    // Assert
    expect(chatUrl).toBe(planRequestChatUrl(PRO, REQUEST))
    expect(openUrl).toHaveBeenCalledExactlyOnceWith(chatUrl)
  })
})

describe('planRequestService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('abre el chat en otra pestaña, sin dar a esa página acceso a esta', () => {
    // Arrange
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    // Act
    const chatUrl = planRequestService.open(PRO, REQUEST)

    // Assert
    expect(open).toHaveBeenCalledExactlyOnceWith(chatUrl, '_blank', 'noopener,noreferrer')
  })
})
