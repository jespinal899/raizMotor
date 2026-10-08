import EmailField from '@/components/EmailField'
import FormSection from '@/components/FormSection'
import PhoneField from '@/components/PhoneField'
import TextField from '@/components/TextField'
import type { CheckoutFieldsProps } from '@/features/shop/hooks/useCheckoutForm'
import { MAX_NAME_LENGTH } from '@/features/shop/utils/checkoutValidation'

/** Largo de un RTN escrito con sus guiones: 0801-1990-123456. */
const MAX_DOCUMENT_LENGTH = 16

/** Primer paso: quién contrata el plan y cómo se le localiza. */
const CheckoutPersonFields = ({ values, errors, change }: CheckoutFieldsProps) => {
  return (
    <FormSection
      titleAs="h3"
      title="¿Quién contrata el plan?"
      description="Con estos datos te contactamos para activar tu plan."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nombre"
          error={errors.firstName}
          name="given-name"
          autoComplete="given-name"
          maxLength={MAX_NAME_LENGTH}
          value={values.firstName}
          onChange={(value) => change('firstName', value)}
        />
        <TextField
          label="Apellido"
          error={errors.lastName}
          name="family-name"
          autoComplete="family-name"
          maxLength={MAX_NAME_LENGTH}
          value={values.lastName}
          onChange={(value) => change('lastName', value)}
        />
      </div>

      <TextField
        label="DNI o RTN"
        hint="opcional"
        error={errors.document}
        name="document"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0801-1990-12345"
        maxLength={MAX_DOCUMENT_LENGTH}
        value={values.document}
        onChange={(value) => change('document', value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <PhoneField
          label="Celular"
          error={errors.phone}
          name="phone"
          value={values.phone}
          onChange={(value) => change('phone', value)}
        />
        <EmailField value={values.email} error={errors.email} onChange={(value) => change('email', value)} />
      </div>
    </FormSection>
  )
}

export default CheckoutPersonFields
