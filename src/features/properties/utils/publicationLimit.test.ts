import { describe, expect, it } from 'vitest'
import {
  MAX_FREE_PUBLICATIONS,
  describeLimitReached,
  hasReachedLimit,
} from '@/features/properties/utils/publicationLimit'

describe('MAX_FREE_PUBLICATIONS', () => {
  it('el plan gratuito incluye una sola publicación', () => {
    // Arrange: el límite es un dato del plan Propietario

    // Act
    const limit = MAX_FREE_PUBLICATIONS

    // Assert
    expect(limit).toBe(1)
  })
})

describe('describeLimitReached', () => {
  it('con el plan gratuito dice que su única publicación ya se usó, y dónde está guardada', () => {
    // Arrange
    const holder = 'tu cuenta'

    // Act
    const message = describeLimitReached(MAX_FREE_PUBLICATIONS, holder)

    // Assert
    expect(message).toEqual({
      title: 'Ya usaste tu publicación gratuita',
      description: 'El plan Propietario incluye una sola publicación y tu cuenta ya tiene una publicada.',
    })
  })

  it('con un plan de varios anuncios dice cuántos incluye y cómo publicar otro', () => {
    // Arrange
    const limit = 25

    // Act
    const message = describeLimitReached(limit, 'tu cuenta')

    // Assert
    expect(message).toEqual({
      title: 'Ya usaste los anuncios de tu plan',
      description: 'Tu plan incluye 25 anuncios publicados a la vez. Despublica o elimina alguno para publicar otro.',
    })
  })
})

describe('hasReachedLimit', () => {
  it('con un plan de varios anuncios, se llega al límite al usarlos todos y no antes', () => {
    // Arrange
    const limit = 3

    // Act
    const reached = [2, 3].map((published) => hasReachedLimit(published, limit))

    // Assert
    expect(reached).toEqual([false, true])
  })

  it.each([
    { published: 0, expected: false },
    { published: 1, expected: true },
    // Navegadores que publicaron varias veces antes de que existiera el límite.
    { published: 3, expected: true },
  ])('con $published anuncios publicados, ¿ya se usó la publicación gratuita? $expected', ({ published, expected }) => {
    // Arrange: cantidad de anuncios que ya hay en este navegador

    // Act
    const reached = hasReachedLimit(published)

    // Assert
    expect(reached).toBe(expected)
  })
})
