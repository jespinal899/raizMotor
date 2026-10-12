import { PROJECT_KINDS, PROJECT_STAGES } from '@/features/projects/data/projectOptions.data'
import type { ProjectFilters, ProjectKind, ProjectStage } from '@/features/projects/types/project.types'
import { ROUTES } from '@/shared/constants/routes'

/** Cómo se llama cada filtro en la dirección: /proyectos?etapa=preventa&zona=palmira. */
const PARAMS = { kind: 'tipo', stage: 'etapa', location: 'zona', maxPrice: 'hasta', page: 'pagina' } as const

/** Proyectos por página del catálogo: dos filas completas de la grilla de tres columnas. */
export const PROJECTS_PER_PAGE = 9

const isKind = (value: string | null): value is ProjectKind => value !== null && Object.hasOwn(PROJECT_KINDS, value)
const isStage = (value: string | null): value is ProjectStage => value !== null && Object.hasOwn(PROJECT_STAGES, value)

/** Lo que pide la dirección. Lo que no se entiende se ignora, en lugar de dejar el catálogo vacío. */
export const parseProjectFilters = (params: URLSearchParams): ProjectFilters => {
  const kind = params.get(PARAMS.kind)
  const stage = params.get(PARAMS.stage)
  const location = params.get(PARAMS.location)?.trim()
  const maxPrice = Number(params.get(PARAMS.maxPrice))

  return {
    ...(isKind(kind) && { kind }),
    ...(isStage(stage) && { stage }),
    ...(location && { location }),
    ...(Number.isFinite(maxPrice) && maxPrice > 0 && { maxPrice }),
  }
}

export const parseProjectPage = (params: URLSearchParams) => {
  const page = Number(params.get(PARAMS.page))

  return Number.isInteger(page) && page > 1 ? page : 1
}

/** La dirección del catálogo con esos filtros, desde la página pedida. */
export const buildProjectsPath = ({ kind, stage, location, maxPrice }: ProjectFilters, page = 1) => {
  const params = new URLSearchParams()
  if (kind) params.set(PARAMS.kind, kind)
  if (stage) params.set(PARAMS.stage, stage)
  if (location?.trim()) params.set(PARAMS.location, location.trim())
  if (maxPrice) params.set(PARAMS.maxPrice, String(maxPrice))
  if (page > 1) params.set(PARAMS.page, String(page))
  const query = params.toString()

  return query ? `${ROUTES.projects}?${query}` : ROUTES.projects
}
