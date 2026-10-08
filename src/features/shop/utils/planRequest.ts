import { PAYMENT_METHODS } from '@/features/shop/data/paymentMethods.data'
import type {
  CheckoutFormValues,
  DetailRow,
  PaymentMethodId,
  PlanRequest,
} from '@/features/shop/types/checkout.types'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { toPlanTotal } from '@/features/shop/utils/planTotal'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'
import { formatLempirasExact } from '@/shared/utils/format'
import { describeDocument, toDocumentDigits } from '@/shared/utils/honduranDocument'
import { formatInternationalPhone, toInternationalPhone } from '@/shared/utils/honduranPhone'
import { whatsAppUrl } from '@/shared/utils/whatsApp'

type RequestedPlan = Pick<AgentPlan, 'name' | 'monthlyPrice'>

const withoutExtraSpaces = (text: string) => text.trim().replace(/\s+/g, ' ')

/**
 * Deja lo escrito en el formulario listo para enviar: sin espacios sobrantes, el documento en dígitos y el
 * celular completo. La forma de pago se recibe aparte, ya elegida.
 */
export const toPlanRequest = (values: CheckoutFormValues, paymentMethod: PaymentMethodId): PlanRequest => ({
  firstName: withoutExtraSpaces(values.firstName),
  lastName: withoutExtraSpaces(values.lastName),
  document: toDocumentDigits(values.document),
  phone: toInternationalPhone(values.phone),
  email: values.email.trim(),
  paymentMethod,
})

/**
 * La solicitud dato a dato: qué plan, cuánto se paga al mes, cómo y quién la pide. Es lo que se revisa en
 * pantalla y lo que lleva el mensaje, para que no puedan decir cosas distintas.
 */
export const describePlanRequest = (plan: RequestedPlan, request: PlanRequest): DetailRow[] => [
  { label: 'Plan', value: plan.name },
  { label: 'Total al mes', value: formatLempirasExact(toPlanTotal(plan.monthlyPrice).total) },
  { label: 'Forma de pago', value: PAYMENT_METHODS[request.paymentMethod].label },
  { label: 'Nombre', value: `${request.firstName} ${request.lastName}` },
  ...(request.document ? [{ label: 'Documento', value: describeDocument(request.document) }] : []),
  { label: 'Celular', value: formatInternationalPhone(request.phone) },
  { label: 'Correo', value: request.email },
]

/** El mensaje con el que una persona pide un plan. */
export const buildPlanRequestMessage = (plan: RequestedPlan, request: PlanRequest): string =>
  [
    `Hola, quiero contratar un plan de ${BRAND.name}.`,
    '',
    ...describePlanRequest(plan, request).map(({ label, value }) => `${label}: ${value}`),
  ].join('\n')

/** Dirección que abre el chat de WhatsApp del sitio con la solicitud ya escrita. */
export const planRequestChatUrl = (plan: RequestedPlan, request: PlanRequest): string =>
  whatsAppUrl(buildPlanRequestMessage(plan, request), CONTACT.phone.e164)
