import ChoiceGroup from '@/components/ChoiceGroup'
import FormSection from '@/components/FormSection'
import { PAYMENT_METHOD_OPTIONS } from '@/features/shop/data/paymentMethods.data'
import type { PaymentMode } from '@/features/shop/data/paymentMode'
import type { CheckoutFieldsProps } from '@/features/shop/hooks/useCheckoutForm'

interface PaymentTexts {
  description: string
  /** La pregunta sobre las opciones. */
  prompt: string
}

/**
 * En el sitio publicado el pago se coordina por WhatsApp, y los textos no prometen otra cosa. Los que
 * hablan de suscribir una tarjeta van solo con la demostración, donde sí existe la pantalla de tarjeta.
 */
const TEXTS: Record<PaymentMode, PaymentTexts> = {
  whatsapp: {
    description: 'Elige cómo quieres pagar.',
    prompt: 'Selecciona el medio de pago que deseas usar',
  },
  demo: {
    description: 'Suscribe tu tarjeta de forma rápida y fácil.',
    prompt: 'Selecciona la tarjeta que deseas usar',
  },
}

interface CheckoutPaymentFieldsProps extends CheckoutFieldsProps {
  paymentMode: PaymentMode
}

/** Tercer paso: con qué se va a pagar. */
const CheckoutPaymentFields = ({ paymentMode, values, errors, change }: CheckoutPaymentFieldsProps) => {
  const { description, prompt } = TEXTS[paymentMode]

  return (
    <FormSection titleAs="h3" title="Medios de pago" description={description}>
      <ChoiceGroup
        label={prompt}
        options={PAYMENT_METHOD_OPTIONS}
        value={values.paymentMethod}
        onChange={(method) => change('paymentMethod', method)}
        error={errors.paymentMethod}
        className="grid-cols-1"
      />
    </FormSection>
  )
}

export default CheckoutPaymentFields
