import { PROJECTS } from '@/features/projects/data/projects.data'
import { createSupabaseProjectGateway } from '@/features/projects/services/projectGateway'
import type { ProjectGateway, ProjectModelRow, ProjectRow } from '@/features/projects/services/projectGateway'
import type { Project, ProjectFilters } from '@/features/projects/types/project.types'
import { matchesProjectFilters } from '@/features/projects/utils/matchesProjectFilters'
import { getDepartmentName } from '@/features/properties/utils/departments'
import { FEATURED_COUNT } from '@/features/properties/utils/featuredListings'
import { showSampleListings } from '@/features/properties/utils/sampleListings'
import { supabase } from '@/lib/supabaseClient'
import type { PageRequest, Paginated } from '@/shared/types/common.types'
import { paginate } from '@/shared/utils/pagination'

export interface ProjectService {
  /** Los destacados de la portada. */
  getFeatured(): Promise<Project[]>
  /** Solo la página pedida de los proyectos que cumplen la búsqueda, con los totales para paginar. */
  search(filters: ProjectFilters, pageRequest: PageRequest): Promise<Paginated<Project>>
  /** El proyecto con sus modelos; `undefined` si no existe o no está publicado. */
  getById(id: string): Promise<Project | undefined>
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Adapta un proyecto guardado a lo que muestran el catálogo y la ficha. */
export const toProject = (
  gateway: Pick<ProjectGateway, 'photoUrl'>,
  row: ProjectRow,
  models: ProjectModelRow[] = [],
  featured = false,
): Project => {
  const gallery = row.photos.map(gateway.photoUrl)

  return {
    id: row.id,
    name: row.name,
    developer: { name: row.developer_name, ...(row.developer_phone && { phone: row.developer_phone }) },
    description: row.description,
    kind: row.kind,
    stage: row.stage,
    ...(row.delivery_date && { deliveryDate: row.delivery_date }),
    priceFrom: row.price_from,
    ...(row.units_total && { unitsTotal: row.units_total }),
    district: row.neighborhood,
    city: row.city,
    department: getDepartmentName(row.department) ?? row.department,
    address: row.address,
    coordinates: { lat: row.latitude, lng: row.longitude },
    amenities: row.amenities,
    image: gallery[0],
    gallery,
    ...(row.video_url && { videoUrl: row.video_url }),
    models: models.map(({ name, bedrooms, bathrooms, area, price_from }) => ({
      name,
      ...(bedrooms !== null && { bedrooms }),
      ...(bathrooms !== null && { bathrooms }),
      area,
      priceFrom: price_from,
    })),
    featured,
  }
}

/**
 * Los proyectos: los publicados en Supabase, si lo hay, y detrás los de ejemplo, marcados como tales. Son
 * pocos (decenas, no miles), así que el catálogo se lee entero y se filtra aquí. Con Supabase, la portada
 * destaca solo los de cuentas con plan de pago, nunca los de ejemplo; sin él, los de ejemplo enseñan el sitio.
 */
export const createProjectService = (samples: readonly Project[], gateway?: ProjectGateway): ProjectService => {
  const examples = samples.map((project) => ({ ...project, example: true }))

  const getAll = async () => [
    ...(gateway ? (await gateway.listPublished()).map((row) => toProject(gateway, row)) : []),
    ...examples,
  ]

  return {
    getFeatured: async () =>
      gateway
        ? (await gateway.listFeatured(FEATURED_COUNT)).map((row) => toProject(gateway, row, [], true))
        : examples.filter((project) => project.featured),

    search: async (filters, pageRequest) =>
      paginate(
        (await getAll()).filter((project) => matchesProjectFilters(project, filters)),
        pageRequest,
      ),

    getById: async (id) => {
      if (gateway && UUID.test(id)) {
        const found = await gateway.findById(id)
        if (found) return toProject(gateway, found.row, found.models)
      }

      return examples.find((project) => project.id === id)
    },
  }
}

export const projectService: ProjectService = createProjectService(
  showSampleListings(supabase !== null, import.meta.env) ? PROJECTS : [],
  supabase ? createSupabaseProjectGateway(supabase) : undefined,
)
