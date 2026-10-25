import { ArrowUpRight, Building2, House, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'
import type { AuthService } from '@/features/auth/services/authService'
import { myProjectsService } from '@/features/projects/services/myProjectsService'
import type { MyProjectsService } from '@/features/projects/services/myProjectsService'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PublicationService } from '@/features/properties/services/publicationService'
import { MAX_FREE_PUBLICATIONS, hasReachedLimit } from '@/features/properties/utils/publicationLimit'
import PricingPage from '@/features/shop/pages/PricingPage'
import { toActivePlan } from '@/features/shop/utils/activePlan'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

/** Lo que admite el plan de la cuenta y cuánto lleva publicado. */
interface AccountPlan {
  propertyLimit: number
  publishedProperties: number
  projectLimit: number
  publishedProjects: number
}

const readPlan = async (publications: PublicationService, projects: MyProjectsService | null): Promise<AccountPlan> => {
  const [propertyLimit, published, projectLimit, ownProjects] = await Promise.all([
    publications.getLimit(),
    publications.listPublished(),
    projects ? projects.getLimit() : 0,
    projects ? projects.listOwn() : [],
  ])

  return {
    propertyLimit,
    publishedProperties: published.length,
    projectLimit,
    publishedProjects: ownProjects.filter(({ status }) => status === 'published').length,
  }
}

/** De pago es todo plan que admite más de un anuncio a la vez o algún proyecto: agente, inmobiliaria o a medida. */
const isPaid = ({ propertyLimit, projectLimit }: AccountPlan) => propertyLimit > MAX_FREE_PUBLICATIONS || projectLimit > 0

interface PublishCardProps {
  id: string
  icon: LucideIcon
  title: string
  published: number
  limit: number
  action: string
  to: string
}

/** Lo que el plan admite de una cosa (propiedades o proyectos), cuánto lleva y el botón para publicar otra. */
const PublishCard = ({ id, icon: Icon, title, published, limit, action, to }: PublishCardProps) => {
  const isFull = hasReachedLimit(published, limit)

  return (
    <section aria-labelledby={id} className="grid content-between gap-5 rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="grid gap-1">
          <h2 id={id} className="font-heading text-lg font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {published} de {limit} publicados.{' '}
            {isFull ? 'Tu plan está completo: despublica uno o mejora tu plan.' : `Puedes publicar ${limit - published} más.`}
          </p>
        </div>
      </div>
      {!isFull && (
        <ButtonLink to={to} className="justify-self-start">
          <Plus />
          {action}
        </ButtonLink>
      )}
    </section>
  )
}

const PaidPlan = ({ plan }: { plan: AccountPlan }) => {
  const { name } = toActivePlan(plan.propertyLimit, plan.projectLimit)
  const hasProjects = plan.projectLimit > 0
  usePageTitle('Tu plan')

  return (
    <Container className="grid gap-8 py-10">
      <PageHeader title="Tu plan" description="Publica con el plan que tienes o mejóralo cuando necesites más." />

      <section
        aria-labelledby="plan-activo"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6"
      >
        <div className="grid gap-1">
          <h2 id="plan-activo" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Tu plan activo
          </h2>
          <p className="flex flex-wrap items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
            {name}
            <Badge>De pago</Badge>
          </p>
        </div>
        {/* Quien publica proyectos mejora entre los planes de inmobiliaria; los demás, entre los de agente. */}
        <ButtonLink to={hasProjects ? ROUTES.agencyPlans : ROUTES.agentPlans} variant="outline">
          <ArrowUpRight />
          Mejorar mi plan
        </ButtonLink>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <PublishCard
          id="plan-propiedades"
          icon={House}
          title="Propiedades"
          published={plan.publishedProperties}
          limit={plan.propertyLimit}
          action="Publicar una propiedad"
          to={ROUTES.publish}
        />
        {hasProjects && (
          <PublishCard
            id="plan-proyectos"
            icon={Building2}
            title="Proyectos"
            published={plan.publishedProjects}
            limit={plan.projectLimit}
            action="Publicar un proyecto"
            to={ROUTES.newProject}
          />
        )}
      </div>

      <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <TextLink to={ROUTES.myProperties}>Ver mis publicaciones</TextLink>
        <TextLink to={ROUTES.pricing}>Ver todos los planes</TextLink>
      </p>
    </Container>
  )
}

interface MyPlanPageProps {
  auth?: AuthService
  publications?: PublicationService
  projects?: MyProjectsService | null
}

/**
 * Adonde lleva «Publicar». Quien tiene un plan de pago no tiene que volver a elegirlo: ve el suyo, publica una
 * propiedad o un proyecto (si su plan los admite) o lo mejora. Sin sesión, con el plan gratuito o si no se pudo
 * leer el plan, se muestran todos los planes, como siempre.
 *
 * Vive aquí, y no en una funcionalidad, porque reúne el plan (Planes) con lo publicado (Propiedades y Proyectos).
 */
const MyPlanPage = ({ auth = authService, publications = publicationService, projects = myProjectsService }: MyPlanPageProps) => {
  const session = useAuth(auth)
  const signedIn = session.status === 'signedIn'
  const { data, isLoading } = useAsyncData(
    async () => (signedIn ? readPlan(publications, projects) : undefined),
    signedIn ? `my-plan:${session.user.email}` : `my-plan:${session.status}`,
  )

  if (session.status === 'loading' || (signedIn && isLoading)) return <PageLoading />
  if (data && isPaid(data)) return <PaidPlan plan={data} />

  return <PricingPage />
}

export default MyPlanPage
