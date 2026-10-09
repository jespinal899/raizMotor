import { describe, expect, it, vi } from 'vitest'
import {
  createPublishedPropertyService,
  toPublishedProperty,
} from '@/features/properties/services/publishedPropertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { Property } from '@/features/properties/types/property.types'
import { toPublication } from '@/features/properties/utils/toPublication'
import { buildProperty, buildPublicationValues } from '@/test/factories'

const record = (id: string, createdAt = 1): StoredPropertyPublication => ({
  id,
  operationKey: `op-${id}`,
  createdAt,
  publication: toPublication(
    buildPublicationValues({
      images: [new File(['foto'], `${id}.jpg`, { type: 'image/jpeg' })],
    }),
  ),
})

/** Una propiedad de muestra tal como la entrega el catálogo: marcada como ejemplo. */
const asExample = (property: Property): Property => ({ ...property, example: true })

const repositoryFor = (records: StoredPropertyPublication[]): PublishedPropertyRepository => ({
  publish: vi.fn(async () => records[0]?.id ?? ''),
  getById: vi.fn(async (id) => records.find((item) => item.id === id)),
  getAll: vi.fn(async () => records),
  getOwn: vi.fn(async () => records),
  getLimit: vi.fn(async () => 1),
  update: vi.fn(async () => {}),
  unpublish: vi.fn(async () => {}),
  republish: vi.fn(async () => {}),
  remove: vi.fn(async () => {}),
})

/** Almacenamiento que no responde: el navegador lo bloquea o no lo tiene. */
const brokenRepository = (): PublishedPropertyRepository => {
  const fail = () => Promise.reject(new Error('Este navegador no permite guardar publicaciones.'))

  return {
    publish: vi.fn(fail),
    getById: vi.fn(fail),
    getAll: vi.fn(fail),
    getOwn: vi.fn(fail),
    getLimit: vi.fn(fail),
    update: vi.fn(fail),
    unpublish: vi.fn(fail),
    republish: vi.fn(fail),
    remove: vi.fn(fail),
  }
}

describe('toPublishedProperty', () => {
  it('adapta un anuncio conservando la dirección, las superficies y las coordenadas', () => {
    // Arrange
    const publication = record('casa-publicada')

    // Act
    const property = toPublishedProperty(publication)

    // Assert
    expect(property).toMatchObject({
      id: 'casa-publicada',
      district: 'Colonia Palmira',
      city: 'Tegucigalpa (Distrito Central)',
      builtArea: 180,
      landArea: 250,
      area: 180,
      location: {
        department: 'Francisco Morazán',
        address: 'Avenida República de Chile, casa 12',
        coordinates: { lat: 14.1, lng: -87.19 },
      },
      featured: false,
    })
    expect(property.advertiser).toBeUndefined()
  })

  it('entrega las fotos como los archivos guardados, con la primera de portada, sin crear direcciones temporales', () => {
    // Arrange
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL')
    const publication = record('casa-publicada')

    // Act
    const property = toPublishedProperty(publication)

    // Assert
    expect(property.gallery).toEqual(publication.publication.images)
    expect(property.image).toBe(publication.publication.images[0])
    expect(createObjectUrl).not.toHaveBeenCalled()
  })

  it('conserva los estacionamientos y las comodidades que se declararon al publicar', () => {
    // Arrange
    const stored = record('casa-publicada')
    const publication = { ...stored, publication: { ...stored.publication, parking: 2, features: ['Piscina', 'Terraza'] } }

    // Act
    const property = toPublishedProperty(publication)

    // Assert
    expect(property.parking).toBe(2)
    expect(property.features).toEqual(['Piscina', 'Terraza'])
  })

  it('un anuncio guardado antes de que se pidieran las comodidades se muestra sin ellas, sin fallar', () => {
    // Arrange
    const stored = record('anuncio-antiguo')
    const { features: _features, ...legacy } = stored.publication
    const publication = { ...stored, publication: legacy } as StoredPropertyPublication

    // Act
    const property = toPublishedProperty(publication)

    // Assert
    expect(property.features).toEqual([])
    expect(property.parking).toBeUndefined()
  })

  it('marca el anuncio como guardado solo en este navegador', () => {
    // Arrange
    const publication = record('casa-publicada')

    // Act
    const property = toPublishedProperty(publication)

    // Assert
    expect(property.localOnly).toBe(true)
  })

  it('un anuncio compartido no se marca como local, y dice quién lo publica y a qué teléfono escribirle', () => {
    // Arrange
    const advertiser = { name: 'Ana Mejía', kind: 'particular', phone: '+50499999999' } as const
    const publication = { ...record('casa-publicada'), advertiser }

    // Act
    const property = toPublishedProperty(publication, { shared: true })

    // Assert
    expect(property.localOnly).toBe(false)
    expect(property.advertiser).toEqual(advertiser)
  })
})

describe('createPublishedPropertyService', () => {
  it('encuentra por su identificador un anuncio publicado en este navegador', async () => {
    // Arrange
    const published = record('publicada')
    const service = createPublishedPropertyService([buildProperty({ id: 'muestra' })], repositoryFor([published]))

    // Act
    const found = await service.getById('publicada')

    // Assert
    expect(found?.title).toBe(published.publication.title)
  })

  it('sigue encontrando las propiedades de ejemplo del catálogo', async () => {
    // Arrange
    const sample = buildProperty({ id: 'muestra' })
    const service = createPublishedPropertyService([sample], repositoryFor([record('publicada')]))

    // Act
    const found = await service.getById('muestra')

    // Assert
    expect(found).toEqual(asExample(sample))
  })

  it('incluye los anuncios locales en búsquedas filtradas y mantiene la paginación', async () => {
    // Arrange
    const published = record('publicada')
    const sample = buildProperty({ id: 'muestra', district: 'Centro' })
    const service = createPublishedPropertyService([sample], repositoryFor([published]))

    // Act
    const result = await service.search({ location: 'Palmira', type: 'casa' }, { page: 1, pageSize: 1 })

    // Assert
    expect(result.items.map((property) => property.id)).toEqual(['publicada'])
    expect(result).toMatchObject({ total: 1, page: 1, pageSize: 1, totalPages: 1 })
  })

  it('lista los anuncios locales antes que los de ejemplo', async () => {
    // Arrange
    const sample = buildProperty({ id: 'muestra' })
    const service = createPublishedPropertyService([sample], repositoryFor([record('publicada')]))

    // Act
    const result = await service.search({}, { page: 1, pageSize: 10 })

    // Assert
    expect(result.items.map((property) => property.id)).toEqual(['publicada', 'muestra'])
  })

  it('no añade los anuncios locales a las propiedades destacadas, ni lee el almacenamiento para mostrarlas', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const repository = repositoryFor([record('publicada')])
    const service = createPublishedPropertyService([featured], repository)

    // Act
    const result = await service.getFeatured()

    // Assert
    expect(result).toEqual([asExample(featured)])
    expect(repository.getAll).not.toHaveBeenCalled()
  })
})

describe('createPublishedPropertyService: ejemplos y anuncios propios', () => {
  it('marca como ejemplo las propiedades de muestra, y no los anuncios publicados', async () => {
    // Arrange
    const service = createPublishedPropertyService([buildProperty({ id: 'muestra' })], repositoryFor([record('publicada')]))

    // Act
    const { items } = await service.search({}, { page: 1, pageSize: 10 })

    // Assert
    expect(items.map(({ id, example }) => [id, example ?? false])).toEqual([
      ['publicada', false],
      ['muestra', true],
    ])
  })

  it('la ficha y las destacadas también dicen que una propiedad de muestra es un ejemplo', async () => {
    // Arrange
    const sample = buildProperty({ id: 'muestra', featured: true })
    const service = createPublishedPropertyService([sample], repositoryFor([]))

    // Act
    const [found, featured] = await Promise.all([service.getById('muestra'), service.getFeatured()])

    // Assert
    expect(found?.example).toBe(true)
    expect(featured[0].example).toBe(true)
  })

  it('entrega los anuncios de quien usa el sitio, sin mezclarlos con los de ejemplo', async () => {
    // Arrange
    const service = createPublishedPropertyService([buildProperty({ id: 'muestra' })], repositoryFor([record('mía')]))

    // Act
    const own = await service.getOwn()

    // Assert
    expect(own.map((property) => property.id)).toEqual(['mía'])
  })

  it('si no se pueden leer los anuncios propios lo rechaza, en lugar de decir que no hay ninguno', async () => {
    // Arrange
    const service = createPublishedPropertyService([], brokenRepository())

    // Act
    const own = service.getOwn()

    // Assert
    await expect(own).rejects.toThrow('Este navegador no permite guardar publicaciones.')
  })
})

describe('createPublishedPropertyService: si el almacenamiento del navegador falla', () => {
  it('la búsqueda sigue mostrando el catálogo de ejemplo', async () => {
    // Arrange
    const sample = buildProperty({ id: 'muestra' })
    const service = createPublishedPropertyService([sample], brokenRepository())

    // Act
    const result = await service.search({}, { page: 1, pageSize: 10 })

    // Assert
    expect(result.items).toEqual([asExample(sample)])
  })

  it('la ficha de una propiedad de ejemplo sigue abriendo', async () => {
    // Arrange
    const sample = buildProperty({ id: 'muestra' })
    const service = createPublishedPropertyService([sample], brokenRepository())

    // Act
    const found = await service.getById('muestra')

    // Assert
    expect(found).toEqual(asExample(sample))
  })

  it('las destacadas de la portada siguen mostrándose', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const service = createPublishedPropertyService([featured], brokenRepository())

    // Act
    const result = await service.getFeatured()

    // Assert
    expect(result).toEqual([asExample(featured)])
  })

  it('un identificador que no es del catálogo de ejemplo se da por no encontrado, sin error', async () => {
    // Arrange
    const service = createPublishedPropertyService([buildProperty({ id: 'muestra' })], brokenRepository())

    // Act
    const found = await service.getById('anuncio-local')

    // Assert
    expect(found).toBeUndefined()
  })
})
