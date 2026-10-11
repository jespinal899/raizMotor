import { describe, expect, it, vi } from 'vitest'
import {
  PublicationLimitError,
  PublicationSignInRequiredError,
  RateLimitedError,
} from '@/features/properties/services/publicationErrors'
import { createSupabasePropertyRepository } from '@/features/properties/services/supabasePropertyRepository'
import type { PropertyGateway, PropertyRow } from '@/features/properties/services/supabasePropertyRepository'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { toPublication } from '@/features/properties/utils/toPublication'
import { buildPublicationValues } from '@/test/factories'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const ANA = 'cuenta-de-ana'
const SAVED_ID = '3f0c2a54-6f0e-4a35-9b6f-0d6f1f6c2a11'
const NEW_ID = '9b1d7c20-1a2b-4c3d-8e4f-5a6b7c8d9e0f'
const PUBLICATION = toPublication(buildPublicationValues())
const PREPARED = new Blob(['foto reducida'], { type: 'image/webp' })

const row = (overrides: Partial<PropertyRow> = {}): PropertyRow => ({
  id: SAVED_ID,
  owner_id: ANA,
  operation_key: 'clave-anterior',
  created_at: '2026-10-09T12:00:00.000Z',
  status: 'published',
  title: 'Casa amplia con patio en Palmira',
  description: 'Casa de dos plantas con patio amplio, cochera techada y cuarto de servicio.',
  type: 'casa',
  operation: 'venta',
  price: 145000,
  department: 'francisco-morazan',
  city: 'Tegucigalpa (Distrito Central)',
  neighborhood: 'Colonia Palmira',
  address: 'Avenida República de Chile, casa 12',
  latitude: 14.1,
  longitude: -87.19,
  built_area: 180,
  land_area: 250,
  bedrooms: 3,
  bathrooms: 2,
  parking: null,
  features: ['Jardín'],
  photos: [`${ANA}/clave-anterior/0.webp`, `${ANA}/clave-anterior/1.webp`],
  advertiser_name: 'Ana Mejía',
  advertiser_phone: '+50499999999',
  ...overrides,
})

interface Database {
  /** Quién tiene la sesión abierta; `null` si nadie. */
  userId?: string | null
  rows?: PropertyRow[]
  /** Anuncios que admite la cuenta, según su perfil; sin valor, la cuenta no tiene perfil. */
  limit?: number
}

/** Una base de datos de mentira que guarda como la de verdad: una sola vez por clave. */
const setup = ({ userId = ANA, rows = [], limit }: Database = {}) => {
  const stored = [...rows]
  const gateway = {
    currentUserId: vi.fn<PropertyGateway['currentUserId']>(async () => userId),
    listPublished: vi.fn<PropertyGateway['listPublished']>(async () => stored),
    searchPublished: vi.fn<PropertyGateway['searchPublished']>(async ({ offset, limit }) => ({
      rows: stored.slice(offset, offset + limit),
      total: stored.length,
    })),
    findById: vi.fn<PropertyGateway['findById']>(async (id) => stored.find((saved) => saved.id === id)),
    listByOwner: vi.fn<PropertyGateway['listByOwner']>(async (owner) => stored.filter((saved) => saved.owner_id === owner)),
    findByOperationKey: vi.fn<PropertyGateway['findByOperationKey']>(async (owner, key) =>
      stored.find((saved) => saved.owner_id === owner && saved.operation_key === key),
    ),
    findLimit: vi.fn<PropertyGateway['findLimit']>(async () => limit),
    insertOnce: vi.fn<PropertyGateway['insertOnce']>(async (added) => {
      if (stored.some((saved) => saved.operation_key === added.operation_key)) return
      stored.unshift(row({ ...added, id: NEW_ID, owner_id: userId ?? '' }))
    }),
    updateById: vi.fn<PropertyGateway['updateById']>(async () => {}),
    setStatus: vi.fn<PropertyGateway['setStatus']>(async (id, status) => {
      stored.splice(0, stored.length, ...stored.map((saved) => (saved.id === id ? { ...saved, status } : saved)))
    }),
    deleteById: vi.fn<PropertyGateway['deleteById']>(async (id) => {
      stored.splice(0, stored.length, ...stored.filter((saved) => saved.id !== id))
    }),
    uploadPhoto: vi.fn<PropertyGateway['uploadPhoto']>(async () => {}),
    removePhotos: vi.fn<PropertyGateway['removePhotos']>(async () => {}),
    photoUrl: (path: string) => `https://fotos.example/${path}`,
  }
  const preparePhoto = vi.fn(async () => PREPARED)

  return { gateway, preparePhoto, repository: createSupabasePropertyRepository({ gateway, preparePhoto }) }
}

describe('createSupabasePropertyRepository: publicar', () => {
  it('sube cada foto, ya reducida, a la carpeta de la cuenta y guarda el anuncio con sus rutas', async () => {
    // Arrange
    const { repository, gateway, preparePhoto } = setup()
    const photoPath = `${ANA}/${TEST_OPERATION_KEY}/0.webp`

    // Act
    const id = await repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(preparePhoto).toHaveBeenCalledExactlyOnceWith(PUBLICATION.images[0])
    expect(gateway.uploadPhoto).toHaveBeenCalledExactlyOnceWith(photoPath, PREPARED)
    expect(gateway.insertOnce).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        operation_key: TEST_OPERATION_KEY,
        title: PUBLICATION.title,
        type: 'casa',
        operation: 'venta',
        price: 145000,
        department: 'francisco-morazan',
        neighborhood: 'Colonia Palmira',
        latitude: 14.1,
        longitude: -87.19,
        built_area: 180,
        bedrooms: 3,
        photos: [photoPath],
      }),
    )
    expect(id).toBe(NEW_ID)
  })

  it('lo que no aplica al tipo de propiedad se guarda sin valor, no como cero', async () => {
    // Arrange
    const { repository, gateway } = setup()
    const land = toPublication(buildPublicationValues({ type: 'terreno' }))

    // Act
    await repository.publish(land, TEST_OPERATION_KEY)

    // Assert
    expect(gateway.insertOnce).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ built_area: null, bedrooms: null, bathrooms: null, parking: null, land_area: 250 }),
    )
  })

  it('repetir la publicación con la misma clave devuelve el mismo anuncio, sin subir las fotos otra vez', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row({ operation_key: TEST_OPERATION_KEY })] })

    // Act
    const id = await repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(id).toBe(SAVED_ID)
    expect(gateway.uploadPhoto).not.toHaveBeenCalled()
    expect(gateway.insertOnce).not.toHaveBeenCalled()
  })

  it('sin sesión rechaza con PublicationSignInRequiredError, sin subir nada', async () => {
    // Arrange
    const { repository, gateway } = setup({ userId: null })

    // Act
    const publishing = repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBeInstanceOf(PublicationSignInRequiredError)
    expect(gateway.uploadPhoto).not.toHaveBeenCalled()
  })

  it('si la base de datos dice que el plan no admite más anuncios, rechaza con PublicationLimitError', async () => {
    // Arrange
    const { repository, gateway } = setup()
    gateway.insertOnce.mockRejectedValue(Object.assign(new Error('publication_limit_reached'), { code: 'RZ001' }))

    // Act
    const publishing = repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBeInstanceOf(PublicationLimitError)
  })

  it('si Storage rechaza una foto por el límite de subidas, rechaza con RateLimitedError, sin guardar el anuncio', async () => {
    // Arrange
    const { repository, gateway } = setup()
    gateway.uploadPhoto.mockRejectedValue(new Error('rate_limited:photo_upload'))

    // Act
    const publishing = repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBeInstanceOf(RateLimitedError)
    expect(gateway.insertOnce).not.toHaveBeenCalled()
  })

  it('si se alcanzó el límite de correcciones, editar rechaza con RateLimitedError y no borra ninguna foto', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })
    gateway.updateById.mockRejectedValue({ code: 'RZ005', message: 'rate_limited:property_edit' })

    // Act
    const updating = repository.update(SAVED_ID, PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(updating).rejects.toBeInstanceOf(RateLimitedError)
    expect(gateway.removePhotos).not.toHaveBeenCalled()
  })

  it('cualquier otro fallo al guardar se entrega tal cual', async () => {
    // Arrange
    const { repository, gateway } = setup()
    const failure = new Error('sin conexión')
    gateway.insertOnce.mockRejectedValue(failure)

    // Act
    const publishing = repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBe(failure)
  })
})

describe('createSupabasePropertyRepository: leer', () => {
  it('entrega los anuncios publicados con sus fotos como direcciones y con quién los publica', async () => {
    // Arrange
    const { repository } = setup({ rows: [row()] })

    // Act
    const [stored] = await repository.getAll()

    // Assert
    expect(stored).toMatchObject({
      id: SAVED_ID,
      operationKey: 'clave-anterior',
      createdAt: Date.parse('2026-10-09T12:00:00.000Z'),
      advertiser: { name: 'Ana Mejía', kind: 'particular', phone: '+50499999999' },
    })
    expect(stored.publication).toMatchObject({
      title: 'Casa amplia con patio en Palmira',
      price: 145000,
      builtArea: 180,
      bedrooms: 3,
      features: ['Jardín'],
      location: { department: 'francisco-morazan', neighborhood: 'Colonia Palmira', coordinates: { lat: 14.1, lng: -87.19 } },
      images: [`https://fotos.example/${ANA}/clave-anterior/0.webp`, `https://fotos.example/${ANA}/clave-anterior/1.webp`],
    })
  })

  it('un dato que el anuncio no declara no aparece, en lugar de llegar como nulo', async () => {
    // Arrange
    const { repository } = setup({ rows: [row({ parking: null, built_area: null })] })

    // Act
    const [{ publication }] = await repository.getAll()

    // Assert
    expect(publication.parking).toBeUndefined()
    expect(publication.builtArea).toBeUndefined()
  })

  it('una cuenta sin nombre ni teléfono se presenta como «Anunciante», sin teléfono al que escribir', async () => {
    // Arrange
    const { repository } = setup({ rows: [row({ advertiser_name: '', advertiser_phone: '' })] })

    // Act
    const [{ advertiser }] = await repository.getAll()

    // Assert
    expect(advertiser).toEqual({ name: 'Anunciante', kind: 'particular' })
  })

  it.each([
    { when: 'uno publicado no está retirado', status: 'published', withdrawn: undefined },
    { when: 'uno despublicado lo retiró quien lo publicó', status: 'unpublished', withdrawn: 'byOwner' },
    { when: 'uno oculto lo retiró el equipo del sitio', status: 'hidden', withdrawn: 'bySite' },
  ] as const)('dice a quien publicó un anuncio si sigue en el catálogo: $when', async ({ status, withdrawn }) => {
    // Arrange
    const { repository } = setup({ rows: [row({ status })] })

    // Act
    const [stored] = await repository.getOwn()

    // Assert
    expect(stored.withdrawn).toBe(withdrawn)
  })

  it('busca en la base de datos con los filtros, el orden y el tramo pedidos, y entrega cuántos los cumplen', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row(), row({ id: NEW_ID })] })
    const filters = {
      type: 'casa' as const,
      operation: 'venta' as const,
      minPrice: 100000,
      maxPrice: 200000,
      minBedrooms: 2,
      minBathrooms: 1,
      sort: 'price-asc' as const,
    }

    // Act
    const slice = await repository.search!({ filters, offset: 0, limit: 6 })

    // Assert
    expect(gateway.searchPublished).toHaveBeenCalledExactlyOnceWith({ ...filters, place: undefined, offset: 0, limit: 6 })
    expect(slice.total).toBe(2)
    expect(slice.records.map((record) => record.id)).toEqual([SAVED_ID, NEW_ID])
  })

  it('busca la zona sin mayúsculas ni tildes, como la guarda la base de datos', async () => {
    // Arrange
    const { repository, gateway } = setup()

    // Act
    await repository.search!({ filters: { location: '  Colón ' }, offset: 0, limit: 6 })

    // Assert
    expect(gateway.searchPublished).toHaveBeenCalledWith(expect.objectContaining({ place: 'colon' }))
  })

  it.each(['%', '_', '*', '\\', '%_*'])('quita de la zona el comodín %j, que haría encontrar cualquier anuncio', async (wildcard) => {
    // Arrange
    const { repository, gateway } = setup()

    // Act
    await repository.search!({ filters: { location: `pal${wildcard}mira` }, offset: 0, limit: 6 })

    // Assert
    expect(gateway.searchPublished).toHaveBeenCalledWith(expect.objectContaining({ place: 'palmira' }))
  })

  it('una zona hecha solo de espacios o comodines no filtra', async () => {
    // Arrange
    const { repository, gateway } = setup()

    // Act
    await repository.search!({ filters: { location: ' %% ' }, offset: 0, limit: 6 })

    // Assert
    expect(gateway.searchPublished).toHaveBeenCalledWith(expect.objectContaining({ place: undefined }))
  })

  it('encuentra un anuncio por su identificador', async () => {
    // Arrange
    const { repository } = setup({ rows: [row()] })

    // Act
    const stored = await repository.getById(SAVED_ID)

    // Assert
    expect(stored?.id).toBe(SAVED_ID)
  })

  it('no pregunta a la base de datos por un identificador que no puede ser de un anuncio', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })

    // Act
    const stored = await repository.getById('casa-lomas-del-guijarro')

    // Assert
    expect(stored).toBeUndefined()
    expect(gateway.findById).not.toHaveBeenCalled()
  })

  it('entrega los anuncios de quien tiene la sesión, y ninguno si no hay sesión', async () => {
    // Arrange
    const rows = [row(), row({ id: NEW_ID, owner_id: 'otra-cuenta' })]
    const signedIn = setup({ rows })
    const signedOut = setup({ rows, userId: null })

    // Act
    const [own, none] = await Promise.all([signedIn.repository.getOwn(), signedOut.repository.getOwn()])

    // Assert
    expect(own.map((stored) => stored.id)).toEqual([SAVED_ID])
    expect(none).toEqual([])
  })

  it.each([
    { when: 'su perfil dice otra cosa', database: { limit: 25 }, expected: 25 },
    { when: 'la cuenta no tiene perfil', database: {}, expected: MAX_FREE_PUBLICATIONS },
    { when: 'no hay sesión', database: { userId: null, limit: 25 }, expected: MAX_FREE_PUBLICATIONS },
  ])('admite $expected anuncios cuando $when', async ({ database, expected }) => {
    // Arrange
    const { repository } = setup(database)

    // Act
    const limit = await repository.getLimit()

    // Assert
    expect(limit).toBe(expected)
  })
})

describe('createSupabasePropertyRepository: editar', () => {
  const KEPT = `https://fotos.example/${ANA}/clave-anterior/1.webp`

  it('guarda los cambios sin tocar de quién es el anuncio ni la clave con que se publicó', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })
    const changes = { ...PUBLICATION, title: 'Casa amplia, precio rebajado', price: 139000, images: [KEPT] }

    // Act
    await repository.update(SAVED_ID, changes, TEST_OPERATION_KEY)

    // Assert
    const [id, saved] = gateway.updateById.mock.calls[0]
    expect(id).toBe(SAVED_ID)
    expect(saved).toMatchObject({ title: 'Casa amplia, precio rebajado', price: 139000, latitude: 14.1 })
    expect(saved).not.toHaveProperty('operation_key')
    expect(saved).not.toHaveProperty('owner_id')
  })

  it('conserva las fotos que siguen, sube las nuevas y borra después las que se quitaron', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })
    const added = PUBLICATION.images[0]
    const uploaded = `${ANA}/${TEST_OPERATION_KEY}/1.webp`

    // Act
    await repository.update(SAVED_ID, { ...PUBLICATION, images: [KEPT, added] }, TEST_OPERATION_KEY)

    // Assert
    expect(gateway.uploadPhoto).toHaveBeenCalledExactlyOnceWith(uploaded, PREPARED)
    expect(gateway.updateById).toHaveBeenCalledExactlyOnceWith(
      SAVED_ID,
      expect.objectContaining({ photos: [`${ANA}/clave-anterior/1.webp`, uploaded] }),
    )
    expect(gateway.removePhotos).toHaveBeenCalledExactlyOnceWith([`${ANA}/clave-anterior/0.webp`])
    expect(gateway.updateById.mock.invocationCallOrder[0]).toBeLessThan(gateway.removePhotos.mock.invocationCallOrder[0])
  })

  it.each([
    { when: 'es de otra cuenta', rows: [row({ owner_id: 'otra-cuenta' })] },
    { when: 'ya no existe', rows: [] },
  ])('lo rechaza sin guardar ni subir nada si el anuncio $when', async ({ rows }) => {
    // Arrange
    const { repository, gateway } = setup({ rows })

    // Act
    const saving = repository.update(SAVED_ID, PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(saving).rejects.toThrow('El anuncio no existe o no es de esta cuenta.')
    expect(gateway.uploadPhoto).not.toHaveBeenCalled()
    expect(gateway.updateById).not.toHaveBeenCalled()
  })

  it('sin sesión rechaza con PublicationSignInRequiredError', async () => {
    // Arrange
    const { repository } = setup({ rows: [row()], userId: null })

    // Act
    const saving = repository.update(SAVED_ID, PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(saving).rejects.toBeInstanceOf(PublicationSignInRequiredError)
  })

  it('una foto que no es del anuncio ni es nueva se rechaza, en lugar de guardar una dirección cualquiera', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })
    const foreign = 'https://otro-sitio.example/foto.jpg'

    // Act
    const saving = repository.update(SAVED_ID, { ...PUBLICATION, images: [foreign] }, TEST_OPERATION_KEY)

    // Assert
    await expect(saving).rejects.toThrow('Esa foto no pertenece al anuncio.')
    expect(gateway.updateById).not.toHaveBeenCalled()
  })
})

describe('createSupabasePropertyRepository: despublicar y volver a publicar', () => {
  it('despublica un anuncio propio, sin tocar nada más de él', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })

    // Act
    await repository.unpublish(SAVED_ID)

    // Assert
    expect(gateway.setStatus).toHaveBeenCalledExactlyOnceWith(SAVED_ID, 'unpublished')
    expect(gateway.updateById).not.toHaveBeenCalled()
    expect((await repository.getOwn())[0].withdrawn).toBe('byOwner')
  })

  it('vuelve a publicar un anuncio que su dueño había despublicado', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row({ status: 'unpublished' })] })

    // Act
    await repository.republish(SAVED_ID)

    // Assert
    expect(gateway.setStatus).toHaveBeenCalledExactlyOnceWith(SAVED_ID, 'published')
    expect((await repository.getOwn())[0].withdrawn).toBeUndefined()
  })

  it('si se alcanzó el límite de cambios de estado, rechaza con RateLimitedError', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })
    gateway.setStatus.mockRejectedValue({ code: 'RZ005', message: 'rate_limited:property_status' })

    // Act
    const unpublishing = repository.unpublish(SAVED_ID)

    // Assert
    await expect(unpublishing).rejects.toBeInstanceOf(RateLimitedError)
  })

  it('si la base de datos dice que el plan está lleno, volver a publicar rechaza con PublicationLimitError', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row({ status: 'unpublished' })] })
    gateway.setStatus.mockRejectedValue(Object.assign(new Error('publication_limit_reached'), { code: 'RZ001' }))

    // Act
    const republishing = repository.republish(SAVED_ID)

    // Assert
    await expect(republishing).rejects.toBeInstanceOf(PublicationLimitError)
  })

  it('cualquier otro fallo al cambiar el estado se entrega tal cual', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()] })
    const failure = new Error('sin conexión')
    gateway.setStatus.mockRejectedValue(failure)

    // Act
    const unpublishing = repository.unpublish(SAVED_ID)

    // Assert
    await expect(unpublishing).rejects.toBe(failure)
  })

  it.each([
    { when: 'es de otra cuenta', rows: [row({ owner_id: 'otra-cuenta' })], reason: 'El anuncio no existe o no es de esta cuenta.' },
    { when: 'ya no existe', rows: [], reason: 'El anuncio no existe o no es de esta cuenta.' },
    { when: 'lo ocultó el equipo del sitio', rows: [row({ status: 'hidden' })], reason: 'El equipo del sitio retiró este anuncio.' },
  ])('no cambia el estado de un anuncio que $when: lo rechaza', async ({ rows, reason }) => {
    // Arrange
    const { repository, gateway } = setup({ rows })

    // Act
    const attempts = await Promise.allSettled([repository.unpublish(SAVED_ID), repository.republish(SAVED_ID)])

    // Assert
    expect(attempts.map((attempt) => attempt.status)).toEqual(['rejected', 'rejected'])
    expect(attempts.map((attempt) => (attempt as PromiseRejectedResult).reason.message)).toEqual([reason, reason])
    expect(gateway.setStatus).not.toHaveBeenCalled()
  })

  it('sin sesión rechaza con PublicationSignInRequiredError', async () => {
    // Arrange
    const { repository, gateway } = setup({ rows: [row()], userId: null })

    // Act
    const unpublishing = repository.unpublish(SAVED_ID)

    // Assert
    await expect(unpublishing).rejects.toBeInstanceOf(PublicationSignInRequiredError)
    expect(gateway.setStatus).not.toHaveBeenCalled()
  })
})

describe('createSupabasePropertyRepository: eliminar', () => {
  it('elimina el anuncio propio y después sus fotos', async () => {
    // Arrange
    const saved = row()
    const { repository, gateway } = setup({ rows: [saved] })

    // Act
    await repository.remove(SAVED_ID)

    // Assert
    expect(gateway.deleteById).toHaveBeenCalledExactlyOnceWith(SAVED_ID)
    expect(gateway.removePhotos).toHaveBeenCalledExactlyOnceWith(saved.photos)
    expect(gateway.deleteById.mock.invocationCallOrder[0]).toBeLessThan(gateway.removePhotos.mock.invocationCallOrder[0])
  })

  it.each([
    { when: 'es de otra cuenta', rows: [row({ owner_id: 'otra-cuenta' })] },
    { when: 'ya no existe', rows: [] },
  ])('no borra nada si el anuncio $when', async ({ rows }) => {
    // Arrange
    const { repository, gateway } = setup({ rows })

    // Act
    await repository.remove(SAVED_ID)

    // Assert
    expect(gateway.deleteById).not.toHaveBeenCalled()
    expect(gateway.removePhotos).not.toHaveBeenCalled()
  })
})
