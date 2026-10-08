import { useState } from 'react'
import { planRequestService } from '@/features/shop/services/planRequestService'
import type { PlanRequestService } from '@/features/shop/services/planRequestService'
import type { CheckoutFormValues } from '@/features/shop/types/checkout.types'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { validateCheckout } from '@/features/shop/utils/checkoutValidation'
import { toPlanRequest } from '@/features/shop/utils/planRequest'
import { useFormFields } from '@/hooks/useFormFields'

const EMPTY_CHECKOUT: CheckoutFormValues = {
  firstName: '',
  lastName: '',
  document: '',
  phone: '',
  email: '',
  paymentMethod: '',
  acceptsTerms: false,
}

type CheckoutForm = ReturnType<typeof useCheckoutForm>

/** Lo que necesita cada bloque de campos del formulario. */
export type CheckoutFieldsProps = Pick<CheckoutForm, 'values' | 'errors' | 'change'>

/** El formulario con el que se pide un plan: valida los datos y abre el chat con la solicitud escrita. */
export const useCheckoutForm = (plan: AgentPlan, service: PlanRequestService = planRequestService) => {
  const {
    values,
    errors,
    change: changeField,
    validateFields,
  } = useFormFields({ initialValues: EMPTY_CHECKOUT, validate: validateCheckout })
  /** La dirección del chat ya abierto. Mientras existe, se recuerda que falta enviar el mensaje. */
  const [chatUrl, setChatUrl] = useState<string>()

  const change: typeof changeField = (field, value) => {
    changeField(field, value)
    // El mensaje abierto llevaba los datos anteriores.
    setChatUrl(undefined)
  }

  const submit = () => {
    // La validación ya exige la forma de pago; la segunda condición solo se lo confirma al compilador.
    if (!validateFields() || values.paymentMethod === '') return

    setChatUrl(service.open(plan, toPlanRequest(values, values.paymentMethod)))
  }

  return { values, errors, chatUrl, change, validate: validateFields, submit }
}
