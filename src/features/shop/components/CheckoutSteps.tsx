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
import CheckoutPurchaseDetail from '@/features/shop/components/CheckoutPurchaseDetail'
import CouponBox from '@/features/shop/components/CouponBox'
import PlanCostSummary from '@/features/shop/components/PlanCostSummary'
import PlanRequestNotice from '@/features/shop/components/PlanRequestNotice'
import { PAYMENT_MODE } from '@/features/shop/data/paymentMode'
import type { PaymentMode } from '@/features/shop/data/paymentMode'
import { useCardPaymentDemo } from '@/features/shop/hooks/useCardPaymentDemo'
import { useCheckoutForm } from '@/features/shop/hooks/useCheckoutForm'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { lastCardDigits } from '@/features/shop/utils/cardDemo'
import { CHECKOUT_STEP, CHECKOUT_STEPS, CHECKOUT_STEP_FIELDS } from '@/features/shop/utils/checkoutSteps'
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
 * Contratar un plan en tres pasos: los datos de suscripción, el resumen y el medio de pago, con el resumen
 * de compra siempre a un lado. El último paso pide el plan por WhatsApp; con tarjeta y solo como
 * demostración de diseño, muestra una pantalla de pago que no cobra nada.
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

      {/*
        En pantallas anchas, el paso va a la izquierda y el resumen de compra a la derecha, acompañándolo. En
        un teléfono van en este orden: el paso, el resumen y los botones, para ver cuánto se paga antes de seguir.
        La tercera fila se queda con lo que el resumen tenga de más alto, y así los botones siguen junto al paso.
      */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <StepScreen
            key={steps.current}
            heading={`Paso ${steps.current + 1} de ${CHECKOUT_STEPS.length}: ${CHECKOUT_STEPS[steps.current]}`}
            // El indicador de arriba ya dice a la vista en qué paso se está.
            hideHeading
            direction={steps.direction}
            isEntering={steps.hasMoved}
          >
            {steps.current === CHECKOUT_STEP.subscription && (
              <CheckoutPersonFields values={values} errors={errors} change={change} />
            )}
            {steps.current === CHECKOUT_STEP.summary && <CheckoutPurchaseDetail plan={plan} />}
            {steps.current === CHECKOUT_STEP.payment && (
              <>
                <CheckoutPaymentFields paymentMode={paymentMode} values={values} errors={errors} change={change} />
                {paysWithDemoCard && (
                  <CardPaymentDemo total={total} values={card.values} errors={card.errors} change={card.change} />
                )}
              </>
            )}
          </StepScreen>
        </div>

        <aside
          aria-label="Resumen de compra"
          className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1"
        >
          <PlanCostSummary plan={plan}>
            {/* En el resumen se cierra la compra: aquí va el código de descuento y se aceptan los términos. */}
            {steps.current === CHECKOUT_STEP.summary && (
              <>
                <CouponBox />
                <TermsCheckboxField
                  lead="Declaro conocer y aceptar los"
                  linkLabel="Términos y Condiciones de uso"
                  multiline
                  checked={values.acceptsTerms}
                  error={errors.acceptsTerms}
                  onChange={(checked) => change('acceptsTerms', checked)}
                />
              </>
            )}
          </PlanCostSummary>
        </aside>

        <div className="grid gap-4 lg:col-start-1 lg:row-start-2">
          {hasStepErrors && (
            <p className="text-sm text-destructive">Revisa los campos marcados antes de continuar.</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {steps.isFirst ? <span /> : <StepBackButton onClick={steps.back} />}
            <Button type="submit" size="lg" className="h-11 px-6 text-base">
              <action.icon aria-hidden="true" />
              {action.label}
            </Button>
          </div>

          {steps.isLast && !paysWithDemoCard && <PlanRequestNotice chatUrl={chatUrl} />}
        </div>
      </div>
    </form>
  )
}

export default CheckoutSteps
