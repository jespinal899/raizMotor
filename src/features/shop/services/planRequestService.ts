import type { PlanRequest } from '@/features/shop/types/checkout.types'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { planRequestChatUrl } from '@/features/shop/utils/planRequest'

export interface PlanRequestService {
  /**
   * Abre el chat con la solicitud ya escrita y devuelve su dirección, por si no llega a abrirse. No envía
   * nada: el mensaje sale cuando la persona lo envía, y eso no se puede saber desde aquí.
   */
  open(plan: AgentPlan, request: PlanRequest): string
}

export const createWhatsAppPlanRequestService = (openUrl: (url: string) => void): PlanRequestService => ({
  open: (plan, request) => {
    const chatUrl = planRequestChatUrl(plan, request)
    openUrl(chatUrl)

    return chatUrl
  },
})

/** En otra pestaña, para no perder el formulario, y sin dar a esa página acceso a esta. */
const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const planRequestService: PlanRequestService = createWhatsAppPlanRequestService(openInNewTab)
