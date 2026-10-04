import { describe, expect, it } from 'vitest'
import { MAX_IMAGES, MAX_IMAGE_BYTES, addImages, describeRejection, imageKey } from '@/features/properties/utils/imageFiles'
import { buildImageFile } from '@/test/factories'

describe('addImages', () => {
  it('acepta fotos JPG, PNG y WebP dentro del tamaño permitido', () => {
    // Arrange
    const photos = [
      buildImageFile({ name: 'fachada.jpg', type: 'image/jpeg' }),
      buildImageFile({ name: 'sala.png', type: 'image/png' }),
      buildImageFile({ name: 'cocina.webp', type: 'image/webp' }),
    ]

    // Act
    const { accepted, rejected } = addImages([], photos)

    // Assert
    expect(accepted).toEqual(photos)
    expect(rejected).toEqual([])
  })

  it('añade las fotos nuevas después de las que ya estaban, conservando el orden', () => {
    // Arrange
    const cover = buildImageFile({ name: 'portada.jpg' })
    const added = [buildImageFile({ name: 'sala.jpg' }), buildImageFile({ name: 'patio.jpg' })]

    // Act
    const { accepted } = addImages([cover], added)

    // Assert
    expect(accepted.map(({ name }) => name)).toEqual(['portada.jpg', 'sala.jpg', 'patio.jpg'])
  })

  it('rechaza los archivos que no son fotos', () => {
    // Arrange
    const document = buildImageFile({ name: 'escritura.pdf', type: 'application/pdf' })

    // Act
    const { accepted, rejected } = addImages([], [document])

    // Assert
    expect(accepted).toEqual([])
    expect(rejected).toEqual([{ name: 'escritura.pdf', reason: 'type' }])
  })

  it('acepta una foto que pesa justo el máximo y rechaza la que lo supera', () => {
    // Arrange
    const atLimit = buildImageFile({ name: 'justa.jpg', size: MAX_IMAGE_BYTES })
    const tooBig = buildImageFile({ name: 'enorme.jpg', size: MAX_IMAGE_BYTES + 1 })

    // Act
    const { accepted, rejected } = addImages([], [atLimit, tooBig])

    // Assert
    expect(accepted).toEqual([atLimit])
    expect(rejected).toEqual([{ name: 'enorme.jpg', reason: 'size' }])
  })

  it('no pasa del máximo de fotos, contando las que ya estaban', () => {
    // Arrange
    const current = Array.from({ length: MAX_IMAGES - 1 }, (_, index) => buildImageFile({ name: `foto-${index}.jpg` }))
    const added = [buildImageFile({ name: 'ultima.jpg' }), buildImageFile({ name: 'sobrante.jpg' })]

    // Act
    const { accepted, rejected } = addImages(current, added)

    // Assert
    expect(accepted).toHaveLength(MAX_IMAGES)
    expect(accepted.at(-1)?.name).toBe('ultima.jpg')
    expect(rejected).toEqual([{ name: 'sobrante.jpg', reason: 'limit' }])
  })

  it('un archivo rechazado no ocupa sitio en el máximo', () => {
    // Arrange
    const current = Array.from({ length: MAX_IMAGES - 1 }, (_, index) => buildImageFile({ name: `foto-${index}.jpg` }))
    const added = [buildImageFile({ name: 'plano.pdf', type: 'application/pdf' }), buildImageFile({ name: 'valida.jpg' })]

    // Act
    const { accepted, rejected } = addImages(current, added)

    // Assert
    expect(accepted.at(-1)?.name).toBe('valida.jpg')
    expect(rejected).toEqual([{ name: 'plano.pdf', reason: 'type' }])
  })
})

describe('addImages: fotos repetidas', () => {
  it('rechaza una foto que ya estaba agregada', () => {
    // Arrange
    const photo = buildImageFile({ name: 'fachada.jpg' })
    const sameAgain = buildImageFile({ name: 'fachada.jpg' })
    Object.defineProperty(sameAgain, 'lastModified', { value: photo.lastModified })

    // Act
    const { accepted, rejected } = addImages([photo], [sameAgain])

    // Assert
    expect(accepted).toEqual([photo])
    expect(rejected).toEqual([{ name: 'fachada.jpg', reason: 'duplicate' }])
  })

  it('rechaza la segunda copia cuando la misma foto se elige dos veces a la vez', () => {
    // Arrange
    const photo = buildImageFile({ name: 'fachada.jpg' })

    // Act
    const { accepted, rejected } = addImages([], [photo, photo])

    // Assert
    expect(accepted).toEqual([photo])
    expect(rejected).toEqual([{ name: 'fachada.jpg', reason: 'duplicate' }])
  })

  it('acepta dos fotos distintas aunque se llamen igual', () => {
    // Arrange
    const small = buildImageFile({ name: 'foto.jpg', size: 1000 })
    const large = buildImageFile({ name: 'foto.jpg', size: 2000 })

    // Act
    const { accepted } = addImages([small], [large])

    // Assert
    expect(accepted).toEqual([small, large])
  })
})

describe('imageKey', () => {
  it('identifica igual a dos copias del mismo archivo y distinto a otro', () => {
    // Arrange
    const photo = buildImageFile({ name: 'fachada.jpg' })
    const other = buildImageFile({ name: 'sala.jpg' })

    // Act
    const keys = [imageKey(photo), imageKey(photo), imageKey(other)]

    // Assert
    expect(keys[0]).toBe(keys[1])
    expect(keys[0]).not.toBe(keys[2])
  })
})

describe('describeRejection', () => {
  it.each([
    { reason: 'type', expected: 'plano.pdf no es una foto JPG, PNG o WebP.' },
    { reason: 'size', expected: 'plano.pdf pesa más de 5 MB.' },
    { reason: 'duplicate', expected: 'plano.pdf ya estaba agregada.' },
    { reason: 'limit', expected: 'plano.pdf no cabe: el máximo son 10 fotos.' },
  ] as const)('explica el descarte por "$reason" nombrando el archivo', ({ reason, expected }) => {
    // Arrange
    const rejected = { name: 'plano.pdf', reason }

    // Act
    const message = describeRejection(rejected)

    // Assert
    expect(message).toBe(expected)
  })
})
