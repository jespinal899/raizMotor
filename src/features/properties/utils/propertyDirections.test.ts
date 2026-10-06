import { describe, expect, it } from 'vitest'
import { buildDirectionsUrl } from '@/features/properties/utils/propertyDirections'

describe('buildDirectionsUrl', () => {
  it('abre en Google Maps la ruta hasta el punto de la propiedad', () => {
    // Arrange
    const coordinates = { lat: 15.498464, lng: -88.0436708 }

    // Act
    const url = new URL(buildDirectionsUrl(coordinates))

    // Assert
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/')
    expect(url.searchParams.get('api')).toBe('1')
    expect(url.searchParams.get('destination')).toBe('15.498464,-88.0436708')
  })

  it('no fija el origen: lo pone quien abre la ruta, desde donde esté', () => {
    // Arrange
    const coordinates = { lat: 14.1, lng: -87.19 }

    // Act
    const url = new URL(buildDirectionsUrl(coordinates))

    // Assert
    expect(url.searchParams.has('origin')).toBe(false)
  })
})
