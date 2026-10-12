import type { Project, ProjectFilters } from '@/features/projects/types/project.types'
import { normalizeText } from '@/shared/utils/text'

/** Si el proyecto cumple la búsqueda. La zona se busca en la colonia y la ciudad, sin mayúsculas ni tildes. */
export const matchesProjectFilters = (project: Project, { kind, stage, location, maxPrice }: ProjectFilters) => {
  const place = normalizeText(location ?? '')

  return (
    (!kind || project.kind === kind) &&
    (!stage || project.stage === stage) &&
    (!maxPrice || project.priceFrom <= maxPrice) &&
    (!place || normalizeText(`${project.district} ${project.city}`).includes(place))
  )
}
