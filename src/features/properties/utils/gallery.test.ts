import { describe, expect, it } from 'vitest'
import { MAX_THUMBNAILS, stepPhoto, toThumbnailStrip } from '@/features/properties/utils/gallery'

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
