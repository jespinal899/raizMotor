import { describe, expect, it } from 'vitest'
import { PUBLICATION_STEPS } from '@/features/properties/utils/publicationSteps'
import { buildPublicationValues } from '@/test/factories'

describe('PUBLICATION_STEPS', () => {
  it('reparte la publicación en tres pasos: propiedad, publicación y últimos detalles', () => {
    // Arrange
    const expectedTitles = ['Propiedad', 'Publicación', 'Últimos detalles']

    // Act
    const titles = PUBLICATION_STEPS.map(({ title }) => title)

    // Assert
    expect(titles).toEqual(expectedTitles)
  })

  it('cada dato del formulario pertenece a un paso, y solo a uno', () => {
    // Arrange
    const formFields = Object.keys(buildPublicationValues()).sort()

    // Act
    const stepFields = PUBLICATION_STEPS.flatMap(({ fields }) => fields).sort()

    // Assert
    expect(stepFields).toEqual(formFields)
  })

  it('la ubicación, el tipo y las medidas van en el primer paso; título y descripción, en el segundo', () => {
    // Arrange
    const [property, listing, details] = PUBLICATION_STEPS

    // Act
    const placement = {
      address: property.fields.includes('address'),
      point: property.fields.includes('coordinates'),
      type: property.fields.includes('type'),
      title: listing.fields.includes('title'),
      description: listing.fields.includes('description'),
      price: details.fields.includes('price'),
      photos: details.fields.includes('images'),
    }

    // Assert
    expect(Object.values(placement).every(Boolean)).toBe(true)
  })
})
