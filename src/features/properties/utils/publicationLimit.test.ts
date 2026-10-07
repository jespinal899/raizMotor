import { describe, expect, it } from 'vitest'
import { MAX_FREE_PUBLICATIONS, hasReachedFreeLimit } from '@/features/properties/utils/publicationLimit'

describe('MAX_FREE_PUBLICATIONS', () => {
  it('el plan gratuito incluye una sola publicación', () => {
    // Arrange: el límite es un dato del plan Propietario

    // Act
    const limit = MAX_FREE_PUBLICATIONS

    // Assert
    expect(limit).toBe(1)
  })
})

describe('hasReachedFreeLimit', () => {
  it.each([
    { published: 0, expected: false },
    { published: 1, expected: true },
    // Navegadores que publicaron varias veces antes de que existiera el límite.
    { published: 3, expected: true },
  ])('con $published anuncios publicados, ¿ya se usó la publicación gratuita? $expected', ({ published, expected }) => {
    // Arrange: cantidad de anuncios que ya hay en este navegador

    // Act
    const reached = hasReachedFreeLimit(published)

    // Assert
    expect(reached).toBe(expected)
  })
})
