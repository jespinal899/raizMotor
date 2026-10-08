import type { FormEvent } from 'react'
import { ArrowRight, CreditCard, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import StepBackButton from '@/components/StepBackButton'
import StepIndicator from '@/components/StepIndicator'
import StepScreen from '@/components/StepScreen'
import TermsCheckboxField from '@/components/TermsCheckboxField'
import { Button } from '@/components/ui/button'
import CardPaymentDemo from '@/features/shop/components/CardPaymentDemo'
import CardPaymentDemoReceipt from '@/features/shop/components/CardPaymentDemoReceipt'
import CheckoutPaymentFields from '@/features/shop/components/CheckoutPaymentFields'
import CheckoutPersonFields from '@/features/shop/components/CheckoutPersonFields'
import CheckoutReview from '@/features/shop/components/CheckoutReview'
import PlanRequestNotice from '@/features/shop/components/PlanRequestNotice'
import { PAYMENT_MODE } from '@/features/shop/data/paymentMode'
import type { PaymentMode } from '@/features/shop/data/paymentMode'
import { useCardPaymentDemo } from '@/features/shop/hooks/useCardPaymentDemo'
import { useCheckoutForm } from '@/features/shop/hooks/useCheckoutForm'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { lastCardDigits } from '@/features/shop/utils/cardDemo'
import { CHECKOUT_STEPS, CHECKOUT_STEP_FIELDS } from '@/features/shop/utils/checkoutSteps'
import { toPlanRequest } from '@/features/shop/utils/planRequest'
import { toPlanTotal } from '@/features/shop/utils/planTotal'
import { useInvalidFieldFocus } from '@/hooks/useInvalidFieldFocus'
import { useSteps } from '@/hooks/useSteps'
import { formatLempirasExact } from '@/shared/utils/format'

interface CheckoutStepsProps {
  plan: AgentPlan
  /** Cómo termina la contratación. Por defecto, la del sitio: por WhatsApp salvo al desarrollar. */
  paymentMode?: PaymentMode
}

interface FinalAction {
  icon: LucideIcon
  label: string
}

/**
 * Contratar un plan en tres pasos: los datos de la persona, el resumen con la forma de pago y la
 * confirmación. El último pide el plan por WhatsApp; con tarjeta y solo como demostración de diseño,
 * muestra una pantalla de pago que no cobra nada.
 */
const CheckoutSteps = ({ plan, paymentMode = PAYMENT_MODE }: CheckoutStepsProps) => {
  const { values, errors, chatUrl, change, validate, submit } = useCheckoutForm(plan)
  const card = useCardPaymentDemo()
  const steps = useSteps(CHECKOUT_STEPS.length)
  const { containerRef, focusFirstInvalid } = useInvalidFieldFocus<HTMLFormElement>()

  const total = formatLempirasExact(toPlanTotal(plan.monthlyPrice).total)
  const paysWithDemoCard = paymentMode === 'demo' && values.paymentMethod === 'tarjeta'
  const finalAction: FinalAction = paysWithDemoCard
    ? { icon: CreditCard, label: `Pagar ${total}` }
    : { icon: MessageCircle, label: 'Enviar solicitud por WhatsApp' }
  const action: FinalAction = steps.isLast ? finalAction : { icon: ArrowRight, label: 'Siguiente' }
  const hasStepErrors = CHECKOUT_STEP_FIELDS[steps.current].some((field) => errors[field])

  const goNext = () => {
    if (validate(CHECKOUT_STEP_FIELDS[steps.current])) steps.next()
    else focusFirstInvalid()
  }

  const finish = () => {
    // Cada paso se validó al avanzar, pero se pudo volver atrás y dejar algo sin corregir.
    const firstInvalidStep = CHECKOUT_STEP_FIELDS.findIndex((fields) => !validate(fields))

    if (firstInvalidStep !== -1) {
      steps.goTo(firstInvalidStep)
      focusFirstInvalid()
      return
    }

    if (!paysWithDemoCard) submit()
    else if (!card.pay()) focusFirstInvalid()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (steps.isLast) finish()
    else goNext()
  }

  if (card.isPaid) {
    return <CardPaymentDemoReceipt plan={plan} total={total} lastDigits={lastCardDigits(card.values.number)} />
  }

  return (
    <form
      ref={containerRef}
      noValidate
      aria-label="Formulario para contratar el plan"
      onSubmit={handleSubmit}
      className="grid gap-8"
    >
      <StepIndicator label="Pasos para contratar" steps={CHECKOUT_STEPS} current={steps.current} />

      <StepScreen
        key={steps.current}
        heading={`Paso ${steps.current + 1} de ${CHECKOUT_STEPS.length}: ${CHECKOUT_STEPS[steps.current]}`}
        direction={steps.direction}
        isEntering={steps.hasMoved}
      >
        {steps.current === 0 && <CheckoutPersonFields values={values} errors={errors} change={change} />}
        {steps.current === 1 && <CheckoutPaymentFields plan={plan} values={values} errors={errors} change={change} />}
        {/* A la confirmación solo se llega con la forma de pago ya elegida. */}
        {steps.isLast && values.paymentMethod !== '' && (
          <>
            {paysWithDemoCard ? (
              <CardPaymentDemo total={total} values={card.values} errors={card.errors} change={card.change} />
            ) : (
              <CheckoutReview plan={plan} request={toPlanRequest(values, values.paymentMethod)} />
            )}
            <TermsCheckboxField
              checked={values.acceptsTerms}
              error={errors.acceptsTerms}
              onChange={(checked) => change('acceptsTerms', checked)}
            />
          </>
        )}
      </StepScreen>

      <div className="grid gap-4">
        {hasStepErrors && <p className="text-sm text-destructive">Revisa los campos marcados antes de continuar.</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {steps.isFirst ? <span /> : <StepBackButton onClick={steps.back} />}
          <Button type="submit" size="lg" className="h-11 px-6 text-base">
            <action.icon aria-hidden="true" />
            {action.label}
          </Button>
        </div>

        {steps.isLast && !paysWithDemoCard && <PlanRequestNotice chatUrl={chatUrl} />}
      </div>
    </form>
  )
}

export default CheckoutSteps
