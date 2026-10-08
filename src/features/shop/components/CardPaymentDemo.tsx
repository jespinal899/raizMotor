import { FlaskConical } from 'lucide-react'
import FormSection from '@/components/FormSection'
import StatusAlert from '@/components/StatusAlert'
import TextField from '@/components/TextField'
import type { CardDemoFieldsProps } from '@/features/shop/hooks/useCardPaymentDemo'

/** Va a la vista en la propia pantalla: nadie debe tomarla por un cobro de verdad. */
const DEMO_NOTE = {
  icon: FlaskConical,
  title: 'Demostración del pago con tarjeta',
  description:
    'Esta pantalla solo muestra cómo se verá el pago. No se hace ningún cobro, y lo que escribas no se guarda ' +
    'ni se envía.',
}

interface CardPaymentDemoProps extends CardDemoFieldsProps {
  /** El importe a pagar, ya escrito: "L 688.85". */
  total: string
}

/**
 * Tercer paso de muestra para el pago con tarjeta. Es solo diseño: los campos no admiten que el navegador
 * proponga una tarjeta guardada, y nada de lo escrito sale de la página.
 */
const CardPaymentDemo = ({ total, values, errors, change }: CardPaymentDemoProps) => {
  return (
    <>
      <StatusAlert role="note" {...DEMO_NOTE} />

      <FormSection titleAs="h3" title="Pago con tarjeta" description={`Total a pagar: ${total}`}>
        <TextField
          label="Número de tarjeta"
          error={errors.number}
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242 4242 4242 4242"
          value={values.number}
          onChange={(value) => change('number', value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Vencimiento"
            error={errors.expiry}
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/AA"
            value={values.expiry}
            onChange={(value) => change('expiry', value)}
          />
          <TextField
            label="Código de seguridad"
            error={errors.securityCode}
            inputMode="numeric"
            autoComplete="off"
            placeholder="CVV"
            value={values.securityCode}
            onChange={(value) => change('securityCode', value)}
          />
        </div>

        <TextField
          label="Nombre del titular"
          error={errors.holder}
          autoComplete="off"
          value={values.holder}
          onChange={(value) => change('holder', value)}
        />
      </FormSection>
    </>
  )
}

export default CardPaymentDemo
