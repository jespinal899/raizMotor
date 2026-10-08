import ChoiceGroup from '@/components/ChoiceGroup'
import FormSection from '@/components/FormSection'
import PlanOrderSummary from '@/features/shop/components/PlanOrderSummary'
import { PAYMENT_METHOD_OPTIONS } from '@/features/shop/data/paymentMethods.data'
import type { CheckoutFieldsProps } from '@/features/shop/hooks/useCheckoutForm'
import type { AgentPlan } from '@/features/shop/types/plan.types'

interface CheckoutPaymentFieldsProps extends CheckoutFieldsProps {
  plan: AgentPlan
}

/** Segundo paso: qué se contrata y cuánto cuesta, y con qué se va a pagar. */
const CheckoutPaymentFields = ({ plan, values, errors, change }: CheckoutPaymentFieldsProps) => {
  return (
    <>
      <PlanOrderSummary plan={plan} />

      <FormSection titleAs="h3" title="¿Cómo quieres pagar?">
        <ChoiceGroup
          label="Forma de pago"
          options={PAYMENT_METHOD_OPTIONS}
          value={values.paymentMethod}
          onChange={(method) => change('paymentMethod', method)}
          error={errors.paymentMethod}
          className="grid-cols-1"
        />
      </FormSection>
    </>
  )
}

export default CheckoutPaymentFields
