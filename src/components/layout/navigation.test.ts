import { describe, expect, it } from 'vitest'
import { FOOTER_SECTIONS, NAV, PROPERTY_CATEGORIES } from '@/components/layout/navigation'
import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import { parseSearchFilters } from '@/features/search/utils/buildSearchQuery'
import { ROUTES } from '@/shared/constants/routes'

describe('NAV', () => {
  it('publicar empieza por elegir plan: su enlace lleva a la página de planes', () => {
    // Arrange
    const publish = NAV.publish

    // Act
    const destination = publish.to

    // Assert
    expect(publish.label).toBe('Publicar')
    expect(destination).toBe(ROUTES.pricing)
  })

  it('el pie no repite destino: "Planes" y "Publicar" llevarían al mismo sitio', () => {
    // Arrange
    const links = FOOTER_SECTIONS.flatMap((section) => section.links)

    // Act
    const destinations = links.map((link) => link.to)

    // Assert
    expect(new Set(destinations).size).toBe(destinations.length)
    expect(destinations).toContain(ROUTES.pricing)
  })
})

describe('PROPERTY_CATEGORIES', () => {
  it('ofrece terrenos, casas y apartamentos, en ese orden', () => {
    // Arrange
    const expectedLabels = ['Terrenos', 'Casas', 'Apartamentos']

    // Act
    const labels = PROPERTY_CATEGORIES.map((category) => category.label)

    // Assert
    expect(labels).toEqual(expectedLabels)
  })

  it('cada enlace del menú abre resultados filtrados por un tipo que existe', () => {
    // Arrange
    const knownTypes = Object.keys(PROPERTY_TYPES)

    // Act
    const typesFromLinks = PROPERTY_CATEGORIES.map(
      ({ to }) => parseSearchFilters(to.split('/').pop(), new URLSearchParams()).type,
    )

    // Assert
    expect(typesFromLinks).toEqual(['terreno', 'casa', 'apartamento'])
    expect(knownTypes).toEqual(expect.arrayContaining(typesFromLinks))
  })
})
