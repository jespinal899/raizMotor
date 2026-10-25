import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PROJECT_KINDS, PROJECT_MAX_PRICES, PROJECT_STAGES } from '@/features/projects/data/projectOptions.data'
import type { ProjectFilters as Filters, ProjectKind, ProjectStage } from '@/features/projects/types/project.types'
import { buildProjectsPath } from '@/features/projects/utils/projectSearch'
import SearchField from '@/features/search/components/SearchField'
import SelectField from '@/features/search/components/SelectField'
import { ANY_OPTION } from '@/features/search/utils/searchOptions'
import type { SelectOption } from '@/shared/types/common.types'
import { formatPrice } from '@/shared/utils/format'

const KIND_OPTIONS: SelectOption[] = [
  { value: ANY_OPTION, label: 'Todos los tipos' },
  ...(Object.keys(PROJECT_KINDS) as ProjectKind[]).map((kind) => ({ value: kind, label: PROJECT_KINDS[kind].plural })),
]

const STAGE_OPTIONS: SelectOption[] = [
  { value: ANY_OPTION, label: 'Todas las etapas' },
  ...(Object.keys(PROJECT_STAGES) as ProjectStage[]).map((stage) => ({ value: stage, label: PROJECT_STAGES[stage].label })),
]

const PRICE_OPTIONS: SelectOption[] = [
  { value: ANY_OPTION, label: 'Sin límite' },
  ...PROJECT_MAX_PRICES.map((price) => ({ value: String(price), label: `Desde ${formatPrice(price)} o menos` })),
]

const valueOf = (options: SelectOption[], value: string | number | undefined) =>
  options.some((option) => option.value === String(value)) ? String(value) : ANY_OPTION

const pick = <T extends string>(value: string) => (value === ANY_OPTION ? undefined : (value as T))

interface ProjectFiltersProps {
  /** La búsqueda que se está viendo, tal como la dice la dirección de la página. */
  filters: Filters
}

/**
 * Filtros del catálogo de proyectos. Los desplegables se aplican al momento; la zona, al buscarla. Cada cambio
 * lleva a la dirección con ese filtro, conservando los demás y desde la primera página.
 */
const ProjectFilters = ({ filters }: ProjectFiltersProps) => {
  const navigate = useNavigate()
  const [location, setLocation] = useState(filters.location ?? '')
  const locationLabelId = useId()

  const refine = (changes: Partial<Filters>) => void navigate(buildProjectsPath({ ...filters, ...changes }))

  const searchLocation = (event: FormEvent) => {
    event.preventDefault()
    refine({ location: location.trim() || undefined })
  }

  return (
    <div role="group" aria-label="Filtrar los proyectos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <form role="search" onSubmit={searchLocation}>
        <SearchField label="Zona" labelId={locationLabelId}>
          <div className="flex gap-2">
            <Input
              aria-labelledby={locationLabelId}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Colonia o ciudad"
              type="search"
              enterKeyHint="search"
              className="h-11"
            />
            <Button type="submit" size="icon" aria-label="Buscar por zona" className="size-11 shrink-0">
              <Search />
            </Button>
          </div>
        </SearchField>
      </form>
      <SelectField
        label="Tipo de proyecto"
        options={KIND_OPTIONS}
        value={valueOf(KIND_OPTIONS, filters.kind)}
        onChange={(value) => refine({ kind: pick<ProjectKind>(value) })}
      />
      <SelectField
        label="Etapa"
        options={STAGE_OPTIONS}
        value={valueOf(STAGE_OPTIONS, filters.stage)}
        onChange={(value) => refine({ stage: pick<ProjectStage>(value) })}
      />
      <SelectField
        label="Precio desde"
        options={PRICE_OPTIONS}
        value={valueOf(PRICE_OPTIONS, filters.maxPrice)}
        onChange={(value) => refine({ maxPrice: value === ANY_OPTION ? undefined : Number(value) })}
      />
    </div>
  )
}

export default ProjectFilters
