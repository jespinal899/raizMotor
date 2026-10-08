import { PAYMENT_METHODS } from '@/features/shop/data/paymentMethods.data'
import type {
  CheckoutFormValues,
  DetailRow,
  PaymentMethodId,
  PlanApplicant,
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
 * Deja los datos de la persona listos para enviar: sin espacios sobrantes, el documento en dígitos y el
 * celular completo.
 */
export const toPlanApplicant = (values: CheckoutFormValues): PlanApplicant => ({
  firstName: withoutExtraSpaces(values.firstName),
  lastName: withoutExtraSpaces(values.lastName),
  document: toDocumentDigits(values.document),
  phone: toInternationalPhone(values.phone),
  email: values.email.trim(),
})

/** La solicitud completa. La forma de pago se recibe aparte, ya elegida. */
export const toPlanRequest = (values: CheckoutFormValues, paymentMethod: PaymentMethodId): PlanRequest => ({
  ...toPlanApplicant(values),
  paymentMethod,
})

/** Quién pide el plan, dato a dato. Es lo que se revisa en pantalla antes de pagar. */
export const describeApplicant = (applicant: PlanApplicant): DetailRow[] => [
  { label: 'Nombre', value: `${applicant.firstName} ${applicant.lastName}` },
  ...(applicant.document ? [{ label: 'Documento', value: describeDocument(applicant.document) }] : []),
  { label: 'Celular', value: formatInternationalPhone(applicant.phone) },
  { label: 'Correo', value: applicant.email },
]

/** La solicitud dato a dato: qué plan, cuánto se paga al mes, cómo y quién la pide. */
export const describePlanRequest = (plan: RequestedPlan, request: PlanRequest): DetailRow[] => [
  { label: 'Plan', value: plan.name },
  { label: 'Total al mes', value: formatLempirasExact(toPlanTotal(plan.monthlyPrice).total) },
  { label: 'Forma de pago', value: PAYMENT_METHODS[request.paymentMethod].label },
  ...describeApplicant(request),
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
