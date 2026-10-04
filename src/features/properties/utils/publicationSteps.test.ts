import { describe, expect, it } from 'vitest'
import { PUBLICATION_SCREENS, PUBLICATION_STEPS } from '@/features/properties/utils/publicationSteps'
import { buildPublicationValues } from '@/test/factories'

const screensOf = (step: string) =>
  PUBLICATION_SCREENS.filter((screen) => PUBLICATION_STEPS[screen.step] === step).map(({ title }) => title)

describe('PUBLICATION_STEPS', () => {
  it('la publicación tiene tres pasos: propiedad, publicación y últimos detalles', () => {
    // Arrange
    const expectedSteps = ['Propiedad', 'Publicación', 'Últimos detalles']

    // Act
    const steps = PUBLICATION_STEPS

    // Assert
    expect(steps).toEqual(expectedSteps)
  })
})

describe('PUBLICATION_SCREENS', () => {
  it('reparte los pasos en cinco pantallas, en el orden en que se recorren', () => {
    // Arrange
    const expectedScreens = ['Ubicación', 'Tipo de propiedad', 'Título y descripción', 'Venta o alquiler', 'Fotos']

    // Act
    const screens = PUBLICATION_SCREENS.map(({ title }) => title)

    // Assert
    expect(screens).toEqual(expectedScreens)
  })

  it('el primer paso pide la ubicación y el tipo en pantallas separadas; el último, la operación y las fotos', () => {
    // Arrange
    const [property, listing, details] = PUBLICATION_STEPS

    // Act
    const screensByStep = {
      property: screensOf(property),
      listing: screensOf(listing),
      details: screensOf(details),
    }

    // Assert
    expect(screensByStep).toEqual({
      property: ['Ubicación', 'Tipo de propiedad'],
      listing: ['Título y descripción'],
      details: ['Venta o alquiler', 'Fotos'],
    })
  })

  it('cada dato del formulario se pide en una pantalla, y solo en una', () => {
    // Arrange
    const formFields = Object.keys(buildPublicationValues()).sort()

    // Act
    const screenFields = PUBLICATION_SCREENS.flatMap(({ fields }) => fields).sort()

    // Assert
    expect(screenFields).toEqual(formFields)
  })

  it('la pantalla de ubicación solo pide la dirección y su punto en el mapa', () => {
    // Arrange
    const [location] = PUBLICATION_SCREENS

    // Act
    const fields = [...location.fields].sort()

    // Assert
    expect(fields).toEqual(['address', 'city', 'coordinates', 'department', 'neighborhood'])
  })

  it('el precio se pide en la misma pantalla que la operación, y las fotos van solas al final', () => {
    // Arrange
    const [pricing, photos] = PUBLICATION_SCREENS.slice(-2)

    // Act
    const fields = { pricing: pricing.fields, photos: photos.fields }

    // Assert
    expect(fields).toEqual({ pricing: ['operation', 'price'], photos: ['images'] })
  })
})
