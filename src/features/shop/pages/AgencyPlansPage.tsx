import { Building2, Check, Layers, Star } from 'lucide-react'
import BackLink from '@/components/BackLink'
import PageHeader from '@/components/PageHeader'
import Container from '@/components/layout/Container'
import PlanFeatures from '@/features/shop/components/PlanFeatures'
import PlanHelp from '@/features/shop/components/PlanHelp'
import PlanList from '@/features/shop/components/PlanList'
import PlanMonthlyPrice from '@/features/shop/components/PlanMonthlyPrice'
import { AGENCY_PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'Planes para inmobiliarias'

/** Lo que el sitio ya hace por una inmobiliaria: nada que todavía no exista. */
const REASONS_TO_CHOOSE = [
  { icon: Building2, text: 'Una sección propia para proyectos en preventa y en construcción.' },
  { icon: Layers, text: 'Cada proyecto con sus modelos, renders, amenidades y mapa.' },
  { icon: Star, text: 'Tus proyectos y propiedades, destacados por turnos en la portada.' },
]

const PLAN_BENEFITS = [
  'Publica, edita y despublica tus proyectos desde «Mis publicaciones».',
  'Los interesados te escriben por WhatsApp desde la ficha del proyecto.',
  'Publica también tu cartera de casas, apartamentos y terrenos.',
  `Presencia profesional dentro de ${BRAND.name}.`,
]

const AgencyPlansPage = () => {
  usePageTitle(TITLE)

  return (
    <Container className="grid gap-10 py-10">
      <div className="grid gap-4">
        <BackLink to={ROUTES.pricing}>Ver todos los planes</BackLink>
        <PageHeader
          title="Lleva tus proyectos a"
          highlight={BRAND.name}
          description="Elige el plan según cuántos proyectos y propiedades vendes a la vez."
          centered
        />
      </div>

      <PlanList plans={AGENCY_PLANS} className="md:grid-cols-2 xl:grid-cols-3">
        {(plan) => (
          <>
            <PlanMonthlyPrice lempiras={plan.monthlyPrice} />
            <PlanFeatures features={plan.features} />
          </>
        )}
      </PlanList>

      <section
        aria-labelledby="agency-plan-benefits-title"
        className="grid gap-8 rounded-2xl border border-primary/15 p-6 shadow-sm sm:p-8 lg:grid-cols-2"
      >
        <div>
          <h2 id="agency-plan-benefits-title" className="font-heading text-2xl font-semibold tracking-tight">
            ¿Por qué publicar en <span className="text-primary">{BRAND.name}</span>?
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
        </div>
        <div>
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
      </section>

      <PlanHelp />
    </Container>
  )
}

export default AgencyPlansPage
