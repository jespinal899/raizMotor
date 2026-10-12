import { ArrowRight } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import Container from '@/components/layout/Container'
import ProjectCollection from '@/features/projects/components/ProjectCollection'
import { useFeaturedProjects } from '@/features/projects/hooks/useFeaturedProjects'
import type { ProjectService } from '@/features/projects/services/projectService'
import { FEATURED_COUNT } from '@/features/properties/utils/featuredListings'
import { ROUTES } from '@/shared/constants/routes'

interface FeaturedProjectsProps {
  service?: ProjectService
}

/** Los proyectos destacados de la portada: de inmobiliarias con un plan de pago. */
const FeaturedProjects = ({ service }: FeaturedProjectsProps) => {
  const { projects, isLoading, error } = useFeaturedProjects(service)

  // Sin destacados, la sección sobra: un título sobre un hueco parecería un fallo.
  if (!isLoading && !error && projects.length === 0) return null

  return (
    <Container as="section" aria-labelledby="proyectos-destacados" className="py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1.5">
          <h2 id="proyectos-destacados" className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Proyectos en preventa
          </h2>
          <p className="text-muted-foreground">Residenciales y torres en planos o en construcción.</p>
        </div>
        <ButtonLink to={ROUTES.projects} variant="outline" size="lg">
          Ver todos los proyectos
          <ArrowRight />
        </ButtonLink>
      </div>

      <ProjectCollection projects={projects} isLoading={isLoading} error={error} skeletonCount={FEATURED_COUNT} />
    </Container>
  )
}

export default FeaturedProjects
