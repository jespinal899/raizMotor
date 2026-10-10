import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { Property, PropertyFilters } from '@/features/properties/types/property.types'
import { getDepartmentName } from '@/features/properties/utils/departments'
import { matchesFilters } from '@/features/properties/utils/matchesFilters'
import { sortProperties } from '@/features/properties/utils/sortProperties'
import type { PageRequest, Paginated } from '@/shared/types/common.types'
import { toPositiveInteger } from '@/shared/utils/pagination'

interface CatalogOptions {
  /** Los anuncios del repositorio los ve cualquiera, no solo quien los guardó en este navegador. */
  shared?: boolean
}

/**
 * Adapta un anuncio guardado a los datos que consumen la búsqueda y la ficha. Las fotos viajan como están
 * guardadas: una dirección, o el archivo si el anuncio vive en este navegador; en ese caso quien las pinta
 * crea su dirección temporal y la libera al dejar de mostrarlas.
 */
export const toPublishedProperty = (
  { id, publication, advertiser, withdrawn }: StoredPropertyPublication,
  { shared = false }: CatalogOptions = {},
): Property => {
  const { location, type, operation, builtArea, landArea, bedrooms, bathrooms, parking, title, description, price } =
    publication
  const { images } = publication
  // Los anuncios guardados antes de que se pidieran las comodidades no las traen.
  const features: string[] | undefined = publication.features

  return {
    id,
    title,
    description,
    type,
    operation,
    price,
    district: location.neighborhood,
    city: location.city,
    area: builtArea ?? landArea!,
    builtArea,
    landArea,
    bedrooms,
    bathrooms,
    parking,
    features: features ?? [],
    image: images[0],
    gallery: images,
    location: {
      department: getDepartmentName(location.department) ?? location.department,
      address: location.address,
      coordinates: location.coordinates,
    },
    advertiser,
    featured: false,
    localOnly: !shared,
    withdrawn,
  }
}

/**
 * Combina los anuncios publicados con el catálogo de ejemplo, cuyas propiedades salen marcadas como tales.
 *
 * Si los anuncios están solo en este navegador, su almacén es un añadido: si no responde, el catálogo de
 * ejemplo se sigue sirviendo. Si son compartidos, un fallo se entrega tal cual: callarlo haría creer que no
 * hay anuncios, o que uno que existe ya no está disponible.
 */
export const createPublishedPropertyService = (
  properties: readonly Property[],
  repository: PublishedPropertyRepository,
  options: CatalogOptions = {},
): PropertyService => {
  const examples = properties.map((property) => ({ ...property, example: true }))
  const samples = createInMemoryPropertyService(examples)
  const toProperty = (record: StoredPropertyPublication) => toPublishedProperty(record, options)

  /** Lo que lee del almacén, o el valor de reserva si el almacén es el del navegador y no responde. */
  const readOr = async <T>(read: () => Promise<T>, fallback: T): Promise<T> => {
    if (options.shared) return read()

    try {
      return await read()
    } catch {
      return fallback
    }
  }

  const getPublished = () => readOr(async () => (await repository.getAll()).map(toProperty), [])

  const findPublished = (id: string) =>
    readOr(async () => {
      const record = await repository.getById(id)

      return record && toProperty(record)
    }, undefined)

  /**
   * Busca en el almacén, que solo entrega la página pedida. Los ejemplos que cumplen la búsqueda van detrás
   * de todos los anuncios reales, en su propio orden: una página puede acabar con unos y seguir con otros.
   */
  const searchStored = async (
    search: NonNullable<PublishedPropertyRepository['search']>,
    filters: PropertyFilters,
    pageRequest: PageRequest,
  ): Promise<Paginated<Property>> => {
    const pageSize = toPositiveInteger(pageRequest.pageSize)
    const matchingExamples = sortProperties(
      examples.filter((property) => matchesFilters(property, filters)),
      filters.sort,
    )

    const readPage = async (page: number) => {
      const offset = (page - 1) * pageSize
      const { records, total } = await readOr(() => search({ filters, offset, limit: pageSize }), {
        records: [],
        total: 0,
      })
      const stored = records.map(toProperty)
      const firstExample = Math.max(0, offset - total)
      const filling = matchingExamples.slice(firstExample, firstExample + pageSize - stored.length)

      return { items: [...stored, ...filling], total: total + matchingExamples.length }
    }

    const requested = toPositiveInteger(pageRequest.page)
    const first = await readPage(requested)
    const totalPages = Math.max(1, Math.ceil(first.total / pageSize))
    // Una página que ya no existe se ajusta a la última, como al filtrar en el navegador.
    const page = Math.min(requested, totalPages)
    const { items, total } = page === requested ? first : await readPage(page)

    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  }

  return {
    // Un anuncio publicado nunca es destacado, así que la portada no necesita leer el almacén.
    getFeatured: () => samples.getFeatured(),
    search: async (filters, pageRequest) =>
      repository.search
        ? searchStored(repository.search, filters, pageRequest)
        : createInMemoryPropertyService([...(await getPublished()), ...examples]).search(filters, pageRequest),
    getById: async (id) => (await findPublished(id)) ?? samples.getById(id),
    // Aquí un fallo no se calla: decir «no tienes anuncios» a quien sí los tiene sería falso.
    getOwn: async () => (await repository.getOwn()).map(toProperty),
  }
}
