import { Building2, CalendarClock, HardHat, Home } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PROJECT_KINDS, PROJECT_STAGES } from '@/features/projects/data/projectOptions.data'
import type { Project } from '@/features/projects/types/project.types'
import { formatDelivery } from '@/features/projects/utils/projectText'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import { formatNumber } from '@/shared/utils/format'

interface Fact {
  label: string
  value: string
  icon: LucideIcon
}

const toFacts = ({ kind, stage, deliveryDate, unitsTotal }: Project): Fact[] => [
  { label: 'Etapa', value: PROJECT_STAGES[stage].label, icon: HardHat },
  { label: 'Tipo', value: PROJECT_KINDS[kind].label, icon: Building2 },
  ...(deliveryDate ? [{ label: 'Entrega estimada', value: formatDelivery(deliveryDate), icon: CalendarClock }] : []),
  ...(unitsTotal ? [{ label: 'Unidades', value: formatNumber(unitsTotal), icon: Home }] : []),
]

/** Lo esencial del proyecto de un vistazo: etapa, tipo, entrega y unidades. */
const ProjectFacts = ({ project }: { project: Project }) => (
  <PropertyDetailSection id="datos-del-proyecto" title="El proyecto">
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {toFacts(project).map(({ label, value, icon: Icon }) => (
        <div key={label} className="grid content-start gap-1 rounded-xl border bg-card p-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {label}
          </dt>
          <dd className="font-heading text-lg font-semibold first-letter:uppercase">{value}</dd>
        </div>
      ))}
    </dl>
    <p className="text-sm text-muted-foreground">{PROJECT_STAGES[project.stage].description}</p>
  </PropertyDetailSection>
)

export default ProjectFacts
