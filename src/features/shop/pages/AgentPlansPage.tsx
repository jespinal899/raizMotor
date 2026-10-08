import { ArrowLeft, BadgeCheck, Check, Headset, PanelsTopLeft } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import PlanFeatures from '@/features/shop/components/PlanFeatures'
import PlanHelp from '@/features/shop/components/PlanHelp'
import PlanList from '@/features/shop/components/PlanList'
import PlanMonthlyPrice from '@/features/shop/components/PlanMonthlyPrice'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'Planes para agentes inmobiliarios'

const REASONS_TO_CHOOSE = [
  { icon: Headset, text: 'Soporte y atención al cliente 24/7.' },
  { icon: PanelsTopLeft, text: 'Administra todo desde un solo panel.' },
  { icon: BadgeCheck, text: 'Tu marca en cada propiedad, sin anuncios externos.' },
]

const PLAN_BENEFITS = [
  'Asesoría personalizada.',
  'Reportes y métricas de tus propiedades.',
  'Gestión centralizada de tus publicaciones.',
  'Mayor exposición para tus propiedades.',
  'Presencia profesional dentro de DomusRaíz.',
]

const AgentPlansPage = () => {
  usePageTitle(TITLE)

  return (
    <Container className="grid gap-10 py-10">
      <div className="grid gap-4">
        <TextLink to={ROUTES.pricing} className="justify-self-start">
          <ArrowLeft aria-hidden="true" />
          Ver todos los planes
        </TextLink>
        <PageHeader
          title="Potencia tu carrera con"
          highlight="DomusRaíz"
          description="Elige el plan que se adapta a tus metas y al tamaño de tu cartera."
          centered
        />
      </div>

      <section className="grid items-start gap-8 xl:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] xl:gap-10">
        <aside
          aria-labelledby="agent-plan-benefits-title"
          className="h-fit rounded-2xl border border-primary/15 bg-transparent p-6 shadow-sm sm:p-8"
        >
          <h2 id="agent-plan-benefits-title" className="font-heading text-2xl font-semibold tracking-tight">
            ¿Por qué contratar en <span className="text-primary">DomusRaíz?</span>
          </h2>
          <ul className="mt-6 grid gap-4 text-sm leading-relaxed">
            {REASONS_TO_CHOOSE.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 border-t border-border/70 pt-6">
            <h3 className="font-heading text-lg font-semibold">Con tu plan obtienes:</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed">
              {PLAN_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <PlanList plans={AGENT_PLANS} className="md:grid-cols-2">
          {(plan) => (
            <>
              <PlanMonthlyPrice lempiras={plan.monthlyPrice} />
              <PlanFeatures features={plan.features} />
            </>
          )}
        </PlanList>
      </section>

      <PlanHelp />
    </Container>
  )
}

export default AgentPlansPage
