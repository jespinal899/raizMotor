import { describe, expect, it } from 'vitest'
import { MAX_THUMBNAILS, adjacentPhotos, stepPhoto, toThumbnailStrip } from '@/features/properties/utils/gallery'

describe('toThumbnailStrip', () => {
  it('si las fotos caben en la tira, se muestran todas y no falta ninguna', () => {
    // Arrange
    const total = MAX_THUMBNAILS

    // Act
    const strip = toThumbnailStrip(total)

    // Assert
    expect(strip).toEqual({ shown: MAX_THUMBNAILS, remaining: 0 })
  })

  it('con una foto más de las que caben, cede la última casilla para decir cuántas faltan', () => {
    // Arrange
    const total = MAX_THUMBNAILS + 1

    // Act
    const strip = toThumbnailStrip(total)

    // Assert
    expect(strip).toEqual({ shown: MAX_THUMBNAILS - 1, remaining: 2 })
  })

  it('con diez fotos enseña tres y dice que faltan siete', () => {
    // Arrange
    const total = 10

    // Act
    const strip = toThumbnailStrip(total)

    // Assert
    expect(strip).toEqual({ shown: 3, remaining: 7 })
  })

  it('lo que enseña y lo que falta suman siempre el total', () => {
    // Arrange
    const totals = [1, 2, 3, 4, 5, 6, 10]

    // Act
    const strips = totals.map((total) => toThumbnailStrip(total))

    // Assert
    expect(strips.map(({ shown, remaining }) => shown + remaining)).toEqual(totals)
  })
})

describe('stepPhoto', () => {
  it('avanza a la foto siguiente', () => {
    // Arrange
    const current = 0

    // Act
    const next = stepPhoto(current, 1, 3)

    // Assert
    expect(next).toBe(1)
  })

  it('retrocede a la foto anterior', () => {
    // Arrange
    const current = 2

    // Act
    const previous = stepPhoto(current, -1, 3)

    // Assert
    expect(previous).toBe(1)
  })

  it('desde la última, la siguiente es la primera', () => {
    // Arrange
    const last = 2

    // Act
    const next = stepPhoto(last, 1, 3)

    // Assert
    expect(next).toBe(0)
  })

  it('desde la primera, la anterior es la última', () => {
    // Arrange
    const first = 0

    // Act
    const previous = stepPhoto(first, -1, 3)

    // Assert
    expect(previous).toBe(2)
  })
})

describe('adjacentPhotos', () => {
  it.each([
    { when: 'en medio, la siguiente y la anterior', current: 2, total: 5, expected: [3, 1] },
    { when: 'en la primera, la segunda y la última', current: 0, total: 5, expected: [1, 4] },
    { when: 'en la última, la primera y la penúltima', current: 4, total: 5, expected: [0, 3] },
    { when: 'con dos fotos, la otra, una sola vez', current: 0, total: 2, expected: [1] },
    { when: 'con una sola foto, ninguna', current: 0, total: 1, expected: [] },
  ])('$when', ({ current, total, expected }) => {
    // Arrange
    const viewing = current

    // Act
    const adjacent = adjacentPhotos(viewing, total)

    // Assert
    expect(adjacent).toEqual(expected)
  })
})
