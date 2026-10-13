import { describe, expect, it, vi } from 'vitest'
import type { MyProjectsGateway } from '@/features/projects/services/myProjectsGateway'
import { createMyProjectsService } from '@/features/projects/services/myProjectsService'
import type { ProjectRow } from '@/features/projects/services/projectGateway'
import type { ProjectSubmission } from '@/features/projects/types/projectForm.types'
import { PublicationLimitError, PublicationSignInRequiredError } from '@/features/properties/services/publicationErrors'

const OWNER = 'cuenta-inmobiliaria'
const PROJECT_ID = '0b9f8c1e-6f3a-4c8e-9a51-2f1c3d4e5f60'

const row = (changes: Partial<ProjectRow> = {}): ProjectRow => ({
  id: PROJECT_ID,
  owner_id: OWNER,
  operation_key: 'clave-1',
  status: 'published',
  name: 'Torre Trejo',
  developer_name: 'Constructora Norte',
  developer_phone: '+50499998888',
  description: 'Torre de apartamentos con piscina y gimnasio.',
  kind: 'torre',
  stage: 'preventa',
  delivery_date: '2027-12-01',
  price_from: 95000,
  units_total: 40,
  department: 'cortes',
  city: 'San Pedro Sula',
  neighborhood: 'Colonia Trejo',
  address: '10 calle',
  latitude: 15.5,
  longitude: -88,
  amenities: ['Piscina'],
  photos: [`${OWNER}/clave-1/0.webp`],
  video_url: null,
  ...changes,
})

const SUBMISSION: ProjectSubmission = {
  department: 'cortes',
  city: 'San Pedro Sula',
  neighborhood: 'Colonia Trejo',
  address: '10 calle',
  coordinates: { lat: 15.5, lng: -88 },
  name: 'Torre Trejo',
  developerName: 'Constructora Norte',
  developerPhone: '+50499998888',
  kind: 'torre',
  stage: 'preventa',
  deliveryDate: '2027-12-01',
  priceFrom: 95000,
  unitsTotal: 40,
  description: 'Torre de apartamentos con piscina y gimnasio.',
  models: [{ name: 'Modelo A', bedrooms: 2, area: 85, priceFrom: 95000 }],
  amenities: ['Piscina'],
  images: [new File(['foto'], 'portada.jpg', { type: 'image/jpeg' })],
}

const PREPARED = new Blob(['reducida'], { type: 'image/webp' })

/** Una base de mentira que guarda como la de verdad: una sola vez por clave. */
const setup = ({ userId = OWNER as string | null, rows = [] as ProjectRow[], limit = 1 } = {}) => {
  const stored = [...rows]
  const gateway = {
    currentUserId: vi.fn(async () => userId),
    findLimit: vi.fn(async () => limit),
    listByOwner: vi.fn(async (owner: string) => stored.filter((saved) => saved.owner_id === owner)),
    findById: vi.fn(async (id: string) => {
      const found = stored.find((saved) => saved.id === id)

      return found && { row: found, models: [{ name: 'Modelo A', bedrooms: 2, bathrooms: null, area: 85, price_from: 95000, position: 0 }] }
    }),
    findByOperationKey: vi.fn(async (owner: string, key: string) => stored.find((saved) => saved.owner_id === owner && saved.operation_key === key)),
    insertOnce: vi.fn(async (added: Parameters<MyProjectsGateway['insertOnce']>[0]) => {
      if (stored.some((saved) => saved.operation_key === added.operation_key)) return
      stored.push(row({ ...added, id: PROJECT_ID, owner_id: OWNER }))
    }),
    updateById: vi.fn(async () => {}),
    replaceModels: vi.fn(async () => {}),
    setStatus: vi.fn(async () => {}),
    deleteById: vi.fn(async () => {}),
    uploadPhoto: vi.fn(async () => {}),
    removePhotos: vi.fn(async () => {}),
    photoUrl: (path: string) => `https://deposito.example/${path}`,
  } satisfies MyProjectsGateway
  const service = createMyProjectsService({ gateway, preparePhoto: vi.fn(async () => PREPARED) })

  return { gateway, service, stored }
}

describe('createMyProjectsService', () => {
  it('publica un proyecto: sube las fotos a la carpeta de la cuenta, lo guarda y deja sus modelos', async () => {
    // Arrange
    const { service, gateway } = setup()

    // Act
    const id = await service.create(SUBMISSION, 'clave-1')

    // Assert
    expect(id).toBe(PROJECT_ID)
    expect(gateway.uploadPhoto).toHaveBeenCalledExactlyOnceWith(`${OWNER}/clave-1/0.webp`, PREPARED)
    expect(gateway.insertOnce).toHaveBeenCalledWith(
      expect.objectContaining({ operation_key: 'clave-1', photos: [`${OWNER}/clave-1/0.webp`], latitude: 15.5, delivery_date: '2027-12-01' }),
    )
    expect(gateway.replaceModels).toHaveBeenCalledExactlyOnceWith(PROJECT_ID, [
      { name: 'Modelo A', bedrooms: 2, bathrooms: null, area: 85, price_from: 95000 },
    ])
  })

  it('repetir el envío con la misma clave no sube ni guarda otro', async () => {
    // Arrange
    const { service, gateway } = setup()
    await service.create(SUBMISSION, 'clave-1')

    // Act
    const id = await service.create(SUBMISSION, 'clave-1')

    // Assert
    expect(id).toBe(PROJECT_ID)
    expect(gateway.insertOnce).toHaveBeenCalledOnce()
    expect(gateway.uploadPhoto).toHaveBeenCalledOnce()
  })

  it('si el plan ya está completo, lo dice con su propio error', async () => {
    // Arrange
    const { service, gateway } = setup()
    gateway.insertOnce.mockRejectedValueOnce({ code: 'RZ001', message: 'project_limit_reached' })

    // Act
    const created = service.create(SUBMISSION, 'clave-2')

    // Assert
    await expect(created).rejects.toBeInstanceOf(PublicationLimitError)
  })

  it('sin sesión no publica nada', async () => {
    // Arrange
    const { service, gateway } = setup({ userId: null })

    // Act
    const created = service.create(SUBMISSION, 'clave-1')

    // Assert
    await expect(created).rejects.toBeInstanceOf(PublicationSignInRequiredError)
    expect(gateway.uploadPhoto).not.toHaveBeenCalled()
  })

  it('al corregirlo conserva las fotos que siguen, sube las nuevas y borra las que ya no usa', async () => {
    // Arrange
    const kept = `${OWNER}/clave-1/0.webp`
    const dropped = `${OWNER}/clave-1/1.webp`
    const { service, gateway } = setup({ rows: [row({ photos: [kept, dropped] })] })
    const newPhoto = new File(['nueva'], 'render.jpg', { type: 'image/jpeg' })

    // Act
    await service.update(PROJECT_ID, { ...SUBMISSION, images: [`https://deposito.example/${kept}`, newPhoto] }, 'edicion-1')

    // Assert
    expect(gateway.updateById).toHaveBeenCalledWith(PROJECT_ID, expect.objectContaining({ photos: [kept, `${OWNER}/edicion-1/1.webp`] }))
    expect(gateway.removePhotos).toHaveBeenCalledExactlyOnceWith([dropped])
  })

  it('no deja corregir, despublicar ni eliminar el proyecto de otra cuenta', async () => {
    // Arrange
    const { service, gateway } = setup({ rows: [row({ owner_id: 'otra-cuenta' })] })

    // Act
    const attempts = [service.update(PROJECT_ID, SUBMISSION, 'x'), service.unpublish(PROJECT_ID), service.remove(PROJECT_ID)]

    // Assert
    for (const attempt of attempts) await expect(attempt).rejects.toThrow('El proyecto no existe o no es de esta cuenta.')
    expect(gateway.updateById).not.toHaveBeenCalled()
    expect(gateway.setStatus).not.toHaveBeenCalled()
    expect(gateway.deleteById).not.toHaveBeenCalled()
  })

  it('despublicar lo deja en borrador, y lo que ocultó el equipo no se toca', async () => {
    // Arrange
    const { service, gateway } = setup({ rows: [row(), row({ id: 'oculto', status: 'hidden' })] })

    // Act
    await service.unpublish(PROJECT_ID)
    const republishHidden = service.republish('oculto')

    // Assert
    expect(gateway.setStatus).toHaveBeenCalledExactlyOnceWith(PROJECT_ID, 'draft')
    await expect(republishHidden).rejects.toThrow('El equipo del sitio retiró este proyecto.')
  })

  it('para corregirlo devuelve lo que se escribió, con el teléfono local y el mes de entrega', async () => {
    // Arrange
    const { service } = setup({ rows: [row()] })

    // Act
    const values = await service.getForEdit(PROJECT_ID)

    // Assert
    expect(values).toMatchObject({
      developerPhone: '9999-8888',
      deliveryMonth: '2027-12',
      priceFrom: '95000',
      models: [{ name: 'Modelo A', bedrooms: '2', bathrooms: '', area: '85', priceFrom: '95000' }],
      images: [`https://deposito.example/${OWNER}/clave-1/0.webp`],
    })
  })

  it('una cuenta sin plan de inmobiliaria admite 0 proyectos', async () => {
    // Arrange
    const { service } = setup({ limit: 0 })

    // Act
    const limit = await service.getLimit()

    // Assert
    expect(limit).toBe(0)
  })
})
