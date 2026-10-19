import { Check, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { Badge } from '@/components/ui/badge'
import ProjectContactCard from '@/features/projects/components/ProjectContactCard'
import ProjectFacts from '@/features/projects/components/ProjectFacts'
import ProjectModels from '@/features/projects/components/ProjectModels'
import type { Project } from '@/features/projects/types/project.types'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import PropertyGallery from '@/features/properties/components/PropertyGallery'
import PropertyLocationSection from '@/features/properties/components/PropertyLocationSection'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import ReportPropertyDialog from '@/features/properties/components/ReportPropertyDialog'
import { projectReportService } from '@/features/projects/services/projectReportService'
import { ROUTES } from '@/shared/constants/routes'
import { toParagraphs } from '@/shared/utils/text'

/** La ficha de un proyecto: renders, datos de la obra, modelos, amenidades y dónde está. */
const ProjectDetail = ({ project }: { project: Project }) => {
  const { id, name, description, district, city, department, address, coordinates, gallery, amenities, models, priceFrom, example } =
    project

  return (
    <PropertyDetailLayout
      breadcrumb={
        <Breadcrumb
          items={[{ label: 'Inicio', to: ROUTES.home }, { label: 'Proyectos', to: ROUTES.projects }, { label: name }]}
        />
      }
      // Un proyecto de ejemplo no es de nadie: no hay a quién reportarlo.
      actions={!example && <ReportPropertyDialog propertyId={id} service={projectReportService} subject="este proyecto" />}
      header={
        <header className="grid gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">{name}</h1>
          <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {district}, {city}
            {example && (
              <Badge variant="outline" className="ml-2">
                Ejemplo
              </Badge>
            )}
          </p>
          <PropertyPrice property={{ price: priceFrom, operation: 'venta' }} prefix="Desde" className="text-3xl" />
        </header>
      }
      gallery={<PropertyGallery images={gallery} title={name} />}
      sidebar={<ProjectContactCard project={project} />}
      wide={
        coordinates &&
        address && (
          <PropertyLocationSection location={{ department, address, coordinates }} district={district} city={city} />
        )
      }
    >
      <ProjectFacts project={project} />

      {models.length > 0 && <ProjectModels models={models} />}

      <PropertyDetailSection id="descripcion-del-proyecto" title="Descripción">
        <div className="grid gap-4 leading-relaxed text-pretty text-muted-foreground">
          {toParagraphs(description).map((paragraph, position) => (
            <p key={position} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </PropertyDetailSection>

      {amenities.length > 0 && (
        <PropertyDetailSection id="amenidades-del-proyecto" title="Amenidades">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {amenities.map((amenity) => (
              <li key={amenity} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {amenity}
              </li>
            ))}
          </ul>
        </PropertyDetailSection>
      )}
    </PropertyDetailLayout>
  )
}

export default ProjectDetail
