import { useState } from 'react'
import { Building2, MessageCircle, PlayCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import FormSelect from '@/components/FormSelect'
import { Card } from '@/components/ui/card'
import AgencyByline from '@/features/agencies/components/AgencyByline'
import { projectQuoteService } from '@/features/projects/services/projectQuoteService'
import type { ProjectQuoteService } from '@/features/projects/services/projectQuoteService'
import type { Project } from '@/features/projects/types/project.types'
import PropertyQuoteForm from '@/features/properties/components/PropertyQuoteForm'
import { formatArea, formatPrice } from '@/shared/utils/format'
import { buildDeveloperChatUrl } from '@/features/projects/utils/projectText'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'
import { cn } from '@/lib/utils'
import { ROUTES, projectDetailPath } from '@/shared/constants/routes'

/** Valor del desplegable cuando no se elige un modelo en particular. */
const ANY_MODEL = 'cualquiera'

interface ProjectContactCardProps {
  project: Project
  quoteService?: ProjectQuoteService
}

/**
 * La tarjeta de la ficha: el formulario para pedir una cotización, con el modelo que interesa, y debajo quién
 * desarrolla el proyecto y cómo escribirle. Un proyecto de ejemplo no es de nadie: no lleva el formulario.
 */
const ProjectContactCard = ({ project, quoteService = projectQuoteService }: ProjectContactCardProps) => {
  const { id, name, developer, videoUrl, models, example, agency } = project
  // Si la desarrolladora es la misma inmobiliaria que lo publica, basta con su logo.
  const showsDeveloper = !agency || developer.name.trim().toLowerCase() !== agency.name.trim().toLowerCase()
  const projectUrl = useAbsoluteUrl(projectDetailPath(id))
  const [model, setModel] = useState(ANY_MODEL)
  const modelOptions = [
    { value: ANY_MODEL, label: 'Cualquier modelo' },
    ...models.map((option) => ({
      value: option.name,
      label: `${option.name} · ${formatArea(option.area)} · desde ${formatPrice(option.priceFrom)}`,
    })),
  ]

  return (
    <Card className="gap-4 p-5">
      {!example && (
        <PropertyQuoteForm
          heading="Cotiza este proyecto"
          description="Déjale tus datos a la desarrolladora y te enviará precios, formas de pago y disponibilidad."
          submitLabel="Pedir cotización"
          onSubmit={(applicant, operationKey) =>
            quoteService.request({ projectId: id, ...(model !== ANY_MODEL && { model }), ...applicant }, operationKey)
          }
        >
          {models.length > 0 && (
            <FormSelect label="Modelo que te interesa" placeholder="Elige un modelo" options={modelOptions} value={model} onChange={setModel} />
          )}
        </PropertyQuoteForm>
      )}

      {agency && (
        <div className={cn(!example && 'border-t pt-4')}>
          <AgencyByline agency={agency} />
        </div>
      )}

      {showsDeveloper && (
        <div className={cn('flex items-center gap-3', !example && !agency && 'border-t pt-4')}>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div className="grid gap-0.5">
            <span className="text-xs text-muted-foreground">Desarrolla</span>
            <span className="font-medium">{developer.name}</span>
          </div>
        </div>
      )}

      {developer.phone ? (
        <ExternalButtonLink href={buildDeveloperChatUrl(name, projectUrl, developer.phone)} size="lg" className="h-11 text-base">
          <MessageCircle />
          Pedir información por WhatsApp
        </ExternalButtonLink>
      ) : (
        <ButtonLink to={ROUTES.contact} size="lg" className="h-11 text-base">
          <MessageCircle />
          Pedir información
        </ButtonLink>
      )}

      {videoUrl && (
        <ExternalButtonLink href={videoUrl} variant="outline" size="lg" className="h-11 text-base">
          <PlayCircle />
          Ver el video del proyecto
        </ExternalButtonLink>
      )}
    </Card>
  )
}

export default ProjectContactCard
