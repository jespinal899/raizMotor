import { describe, expect, it, vi } from 'vitest'
import {
  createPublishedPropertyService,
  toPublishedProperty,
} from '@/features/properties/services/publishedPropertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
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

const repositoryFor = (records: StoredPropertyPublication[]): PublishedPropertyRepository => ({
  publish: vi.fn(async () => records[0]?.id ?? ''),
  getById: vi.fn(async (id) => records.find((item) => item.id === id)),
  getAll: vi.fn(async () => records),
})

/** Almacenamiento que no responde: el navegador lo bloquea o no lo tiene. */
const brokenRepository = (): PublishedPropertyRepository => {
  const fail = () => Promise.reject(new Error('Este navegador no permite guardar publicaciones.'))

  return { publish: vi.fn(fail), getById: vi.fn(fail), getAll: vi.fn(fail) }
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
    expect(found).toEqual(sample)
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
    expect(result).toEqual([featured])
    expect(repository.getAll).not.toHaveBeenCalled()
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
    expect(result.items).toEqual([sample])
  })

  it('la ficha de una propiedad de ejemplo sigue abriendo', async () => {
    // Arrange
    const sample = buildProperty({ id: 'muestra' })
    const service = createPublishedPropertyService([sample], brokenRepository())

    // Act
    const found = await service.getById('muestra')

    // Assert
    expect(found).toEqual(sample)
  })

  it('las destacadas de la portada siguen mostrándose', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const service = createPublishedPropertyService([featured], brokenRepository())

    // Act
    const result = await service.getFeatured()

    // Assert
    expect(result).toEqual([featured])
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
