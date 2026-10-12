import { Building2, CircleAlert, Plus } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import MyPublicationsNav from '@/components/MyPublicationsNav'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import MyProjectCard from '@/features/projects/components/MyProjectCard'
import { useMyProjects } from '@/features/projects/hooks/useMyProjects'
import type { MyProjectsService } from '@/features/projects/services/myProjectsService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

interface MyProjectsPageProps {
  service?: MyProjectsService | null
}

/** Los proyectos de la cuenta: cuántos admite su plan, publicar otro y lo que se puede hacer con cada uno. */
const MyProjectsPage = ({ service }: MyProjectsPageProps) => {
  const { available, projects, published, limit, isLoading, error, unpublish, republish, remove } = useMyProjects(
    service === undefined ? undefined : service,
  )
  usePageTitle('Mis proyectos')

  if (!available) {
    return (
      <PageMessage
        icon={Building2}
        title="Los proyectos aún no están disponibles"
        description="Publicar proyectos necesita las cuentas del sitio, que todavía no están activas."
      />
    )
  }

  if (isLoading) return <PageLoading />

  if (error) {
    return (
      <PageMessage icon={CircleAlert} title="No pudimos cargar tus proyectos" description="Revisa tu conexión y vuelve a intentarlo en unos minutos.">
        <ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>
      </PageMessage>
    )
  }

  const canPublish = published < limit

  return (
    <Container className="grid gap-8 py-10">
      <PageHeader
        title="Mis publicaciones"
        description="Tus proyectos en preventa, en construcción o de entrega inmediata. Puedes corregirlos, despublicarlos o eliminarlos."
      />

      <MyPublicationsNav />

      {limit === 0 && projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Publica proyectos con un plan de inmobiliaria"
          description="Los planes de inmobiliaria te dejan publicar tus proyectos, con sus modelos, renders y mapa, y destacarlos en la portada."
        >
          <ButtonLink to={ROUTES.agencyPlans}>Ver los planes para inmobiliarias</ButtonLink>
        </EmptyState>
      ) : (
        <>
          <section
            aria-labelledby="uso-de-proyectos"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
          >
            <div className="grid gap-1">
              <h2 id="uso-de-proyectos" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Proyectos publicados
              </h2>
              <p className="font-heading text-xl font-semibold">
                {published} de {limit}
              </p>
            </div>
            {canPublish ? (
              <ButtonLink to={ROUTES.newProject}>
                <Plus />
                Publicar un proyecto
              </ButtonLink>
            ) : (
              <ButtonLink to={ROUTES.agencyPlans} variant="outline">
                Tu plan está completo: ver planes
              </ButtonLink>
            )}
          </section>

          {projects.length === 0 ? (
            <EmptyState icon={Building2} title="Todavía no tienes proyectos" description="Publica el primero: tarda unos minutos." />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <MyProjectCard
                    project={project}
                    onUnpublish={() => unpublish(project.id)}
                    onRepublish={() => republish(project.id)}
                    onRemove={() => remove(project.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  )
}

export default MyProjectsPage
