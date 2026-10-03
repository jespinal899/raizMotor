import { describe, expect, it } from 'vitest'
import { HERO_SLIDES } from '@/features/home/data/heroSlides.data'
import { ROUTES } from '@/shared/constants/routes'

describe('HERO_SLIDES', () => {
  it('cada botón lleva a una ruta o sección que existe', () => {
    // Arrange
    const knownDestinations: string[] = Object.values(ROUTES)

    // Act
    const destinations = HERO_SLIDES.flatMap((slide) => [slide.primaryAction.to, slide.secondaryAction.to])

    // Assert
    expect(destinations).toHaveLength(HERO_SLIDES.length * 2)
    expect(knownDestinations).toEqual(expect.arrayContaining(destinations))
  })

  it('cada slide tiene identificador único y todos sus textos', () => {
    // Arrange
    const requiredTexts = ['badge', 'title', 'description', 'image'] as const

    // Act
    const ids = HERO_SLIDES.map((slide) => slide.id)
    const emptyTexts = HERO_SLIDES.flatMap((slide) => requiredTexts.filter((field) => slide[field].trim() === ''))

    // Assert
    expect(new Set(ids).size).toBe(HERO_SLIDES.length)
    expect(emptyTexts).toEqual([])
  })
})
