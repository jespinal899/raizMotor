import { describe, expect, it, vi } from 'vitest'
import { PROJECTS } from '@/features/projects/data/projects.data'
import type { ProjectGateway, ProjectRow } from '@/features/projects/services/projectGateway'
import { createProjectService } from '@/features/projects/services/projectService'

const SAVED_ID = '0b9f8c1e-6f3a-4c8e-9a51-2f1c3d4e5f60'

const row = (changes: Partial<ProjectRow> = {}): ProjectRow => ({
  id: SAVED_ID,
  owner_id: 'inmobiliaria',
  name: 'Torre Real',
  developer_name: 'Constructora Real',
  developer_phone: '+50499998888',
  description: 'Torre de apartamentos con piscina y gimnasio.',
  kind: 'torre',
  stage: 'preventa',
  delivery_date: '2027-12-01',
  price_from: 95000,
  units_total: 80,
  department: 'francisco-morazan',
  city: 'Tegucigalpa (Distrito Central)',
  neighborhood: 'Colonia Palmira',
  address: 'Calle principal',
  latitude: 14.0889,
  longitude: -87.1921,
  amenities: ['Piscina'],
  photos: ['inmobiliaria/torre/0.webp', 'https://fotos.example/render.webp'],
  video_url: null,
  ...changes,
})

const gatewayWith = (rows: ProjectRow[], featured: ProjectRow[] = []): ProjectGateway => ({
  listPublished: vi.fn(async () => rows),
  listFeatured: vi.fn(async () => featured),
  findById: vi.fn(async (id) => {
    const found = rows.find((saved) => saved.id === id)

    return found && { row: found, models: [{ name: 'Modelo A', bedrooms: 2, bathrooms: null, area: 85, price_from: 95000, position: 0 }] }
  }),
  photoUrl: (path) => (path.startsWith('https://') ? path : `https://deposito.example/${path}`),
})

describe('createProjectService', () => {
  it('sin Supabase destaca los proyectos de ejemplo marcados así, como ejemplo', async () => {
    // Arrange
    const service = createProjectService(PROJECTS)

    // Act
    const featured = await service.getFeatured()

    // Assert
    expect(featured.length).toBeGreaterThan(0)
    expect(featured.every((project) => project.featured && project.example)).toBe(true)
  })

  it('con Supabase destaca solo los que elige el servidor, nunca los de ejemplo', async () => {
    // Arrange
    const gateway = gatewayWith([], [row()])
    const service = createProjectService(PROJECTS, gateway)

    // Act
    const featured = await service.getFeatured()

    // Assert
    expect(featured.map(({ id, featured: isFeatured, example }) => [id, isFeatured, example ?? false])).toEqual([[SAVED_ID, true, false]])
    expect(gateway.listFeatured).toHaveBeenCalledExactlyOnceWith(6)
  })

  it('adapta un proyecto guardado: el departamento por su nombre, la colonia como zona y las fotos como direcciones', async () => {
    // Arrange
    const service = createProjectService([], gatewayWith([row()]))

    // Act
    const { items } = await service.search({}, { page: 1, pageSize: 10 })

    // Assert
    expect(items[0]).toMatchObject({
      name: 'Torre Real',
      developer: { name: 'Constructora Real', phone: '+50499998888' },
      district: 'Colonia Palmira',
      department: 'Francisco Morazán',
      deliveryDate: '2027-12-01',
      unitsTotal: 80,
      coordinates: { lat: 14.0889, lng: -87.1921 },
      image: 'https://deposito.example/inmobiliaria/torre/0.webp',
      gallery: ['https://deposito.example/inmobiliaria/torre/0.webp', 'https://fotos.example/render.webp'],
    })
    expect(items[0].videoUrl).toBeUndefined()
  })

  it('el catálogo pone los proyectos reales antes que los de ejemplo, y filtra por etapa, tipo, zona y precio', async () => {
    // Arrange
    const service = createProjectService(PROJECTS, gatewayWith([row()]))

    // Act
    const all = await service.search({}, { page: 1, pageSize: 50 })
    const filtered = await service.search(
      { stage: 'preventa', kind: 'torre', location: 'palmira', maxPrice: 100000 },
      { page: 1, pageSize: 50 },
    )

    // Assert
    expect(all.items[0].id).toBe(SAVED_ID)
    expect(all.total).toBe(PROJECTS.length + 1)
    expect(filtered.items.map(({ id }) => id)).toEqual([SAVED_ID])
  })

  it('pagina el catálogo', async () => {
    // Arrange
    const service = createProjectService(PROJECTS)

    // Act
    const second = await service.search({}, { page: 2, pageSize: 3 })

    // Assert
    expect(second).toMatchObject({ page: 2, totalPages: 2, total: PROJECTS.length })
    expect(second.items).toHaveLength(PROJECTS.length - 3)
  })

  it('la ficha de un proyecto guardado trae sus modelos', async () => {
    // Arrange
    const service = createProjectService([], gatewayWith([row()]))

    // Act
    const project = await service.getById(SAVED_ID)

    // Assert
    expect(project?.models).toEqual([{ name: 'Modelo A', bedrooms: 2, area: 85, priceFrom: 95000 }])
  })

  it('un identificador de ejemplo no se pregunta al servidor, y uno que no existe no se encuentra', async () => {
    // Arrange
    const gateway = gatewayWith([])
    const service = createProjectService(PROJECTS, gateway)

    // Act
    const [sample, missing] = await Promise.all([service.getById(PROJECTS[0].id), service.getById(SAVED_ID)])

    // Assert
    expect(sample?.example).toBe(true)
    expect(missing).toBeUndefined()
    expect(gateway.findById).toHaveBeenCalledOnce()
  })

  it('si el servidor falla, el catálogo lo dice en lugar de mostrar solo los de ejemplo', async () => {
    // Arrange
    const failure = new Error('sin conexión')
    const service = createProjectService(PROJECTS, { ...gatewayWith([]), listPublished: async () => Promise.reject(failure) })

    // Act
    const result = service.search({}, { page: 1, pageSize: 10 })

    // Assert
    await expect(result).rejects.toBe(failure)
  })
})
