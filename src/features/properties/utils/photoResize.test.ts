import { describe, expect, it } from 'vitest'
import { MAX_PHOTO_SIDE, fitWithin, photoExtension } from '@/features/properties/utils/photoResize'

describe('fitWithin', () => {
  it.each([
    { when: 'una foto apaisada grande', size: [4000, 3000], expected: { width: 1600, height: 1200 } },
    { when: 'una foto vertical grande', size: [3000, 4000], expected: { width: 1200, height: 1600 } },
    { when: 'una foto que ya cabe', size: [800, 600], expected: { width: 800, height: 600 } },
    { when: 'una foto justo en el máximo', size: [MAX_PHOTO_SIDE, 900], expected: { width: MAX_PHOTO_SIDE, height: 900 } },
  ])('deja $when dentro del lado máximo sin deformarla ni agrandarla', ({ size, expected }) => {
    // Arrange
    const [width, height] = size

    // Act
    const fitted = fitWithin(width, height)

    // Assert
    expect(fitted).toEqual(expected)
  })
})

describe('photoExtension', () => {
  it.each([
    ['image/webp', 'webp'],
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
  ])('a una foto %s le corresponde la extensión %s', (type, expected) => {
    // Arrange: tipo de la foto ya preparada

    // Act
    const extension = photoExtension(type)

    // Assert
    expect(extension).toBe(expected)
  })

  it('a un tipo que no conoce le pone la de JPG, que es lo más común en fotos', () => {
    // Arrange
    const unknown = 'application/octet-stream'

    // Act
    const extension = photoExtension(unknown)

    // Assert
    expect(extension).toBe('jpg')
  })
})
