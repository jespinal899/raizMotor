import { Building2, CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import AgencyLogo from '@/features/agencies/components/AgencyLogo'
import { PROJECT_KINDS, PROJECT_STAGES } from '@/features/projects/data/projectOptions.data'
import type { Project } from '@/features/projects/types/project.types'
import { formatDelivery } from '@/features/projects/utils/projectText'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import { projectDetailPath } from '@/shared/constants/routes'

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { id, name, kind, stage, deliveryDate, priceFrom, district, city, image, developer, featured, example, agency } =
    project

  return (
    <Card className="relative h-full gap-0 py-0 transition-shadow duration-300 focus-within:shadow-lg hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <PropertyPhoto
          source={image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <div className="absolute top-3 right-3 left-3 flex flex-wrap gap-1.5">
          <Badge>{PROJECT_STAGES[stage].label}</Badge>
          <Badge variant="secondary">{PROJECT_KINDS[kind].label}</Badge>
          {featured && !example && (
            <Badge variant="outline" className="bg-background">
              Destacado
            </Badge>
          )}
          {/* Los proyectos de muestra comparten catálogo con los reales: nadie debe tomar uno por oferta. */}
          {example && (
            <Badge variant="outline" className="bg-background">
              Ejemplo
            </Badge>
          )}
        </div>
        {/* La marca de la inmobiliaria que lo publica, sobre la foto. */}
        {agency && <AgencyLogo agency={agency} className="absolute bottom-3 left-3 size-11 text-xs shadow-sm" />}
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <PropertyPrice property={{ price: priceFrom, operation: 'venta' }} prefix="Desde" />
        <h3 className="text-base leading-snug font-medium">
          {/* El enlace cubre toda la tarjeta para que sea clicable con un único enlace. */}
          <Link
            to={projectDetailPath(id)}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {name}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {district}, {city}
        </p>
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Building2 className="size-4" aria-hidden="true" />
            {developer.name}
          </li>
          {deliveryDate && (
            <li className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              Entrega {formatDelivery(deliveryDate)}
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
