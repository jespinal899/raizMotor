import { describe, expect, it, vi } from 'vitest'
import {
  createPublishedPropertyService,
  toPublishedProperty,
} from '@/features/properties/services/publishedPropertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import { buildProperty, buildPublicationValues } from '@/test/factories'
import { toPublication } from '@/features/properties/utils/toPublication'

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

describe('publishedPropertyService', () => {
  it('adapta un anuncio conservando la dirección, superficies, fotos y coordenadas', () => {
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
    expect(property.gallery).toEqual(['blob:casa-publicada.jpg'])
    expect(property.image).toBe(property.gallery[0])
  })

  it('consulta los anuncios publicados por ID y conserva las muestras del catálogo', async () => {
    // Arrange
    const published = record('publicada')
    const sample = buildProperty({ id: 'muestra' })
    const service = createPublishedPropertyService([sample], repositoryFor([published]))

    // Act
    const found = await service.getById('publicada')
    const old = await service.getById('muestra')

    // Assert
    expect(found?.title).toBe(published.publication.title)
    expect(old).toEqual(sample)
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

  it('no añade los anuncios locales a las propiedades destacadas', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const service = createPublishedPropertyService([featured], repositoryFor([record('publicada')]))

    // Act
    const result = await service.getFeatured()

    // Assert
    expect(result).toEqual([featured])
  })
})
