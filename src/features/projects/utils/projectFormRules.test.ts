import { describe, expect, it } from 'vitest'
import type { ProjectFormValues } from '@/features/projects/types/projectForm.types'
import { EMPTY_PROJECT, toProjectSubmission, validateProject } from '@/features/projects/utils/projectFormRules'

const filled = (changes: Partial<ProjectFormValues> = {}): ProjectFormValues => ({
  ...EMPTY_PROJECT,
  department: 'cortes',
  city: 'San Pedro Sula',
  neighborhood: ' Colonia Trejo ',
  address: '10 calle',
  coordinates: { lat: 15.5, lng: -88 },
  name: 'Torre Trejo',
  developerName: 'Constructora Norte',
  developerPhone: '9999-8888',
  kind: 'torre',
  stage: 'preventa',
  deliveryMonth: '2027-12',
  priceFrom: '95000',
  unitsTotal: '40',
  description: 'Torre de apartamentos con piscina y gimnasio en la azotea.',
  models: [{ name: 'Modelo A', bedrooms: '2', bathrooms: '', area: '85', priceFrom: '95000' }],
  amenities: 'Piscina\n\n Gimnasio \n',
  images: ['https://fotos.example/portada.webp'],
  videoUrl: '',
  ...changes,
})

describe('validateProject', () => {
  it('un proyecto completo no tiene errores', () => {
    // Arrange
    const values = filled()

    // Act
    const errors = validateProject(values)

    // Assert
    expect(Object.values(errors).filter(Boolean)).toEqual([])
  })

  it('pide lo esencial y dice cómo corregirlo', () => {
    // Arrange
    const values = { ...EMPTY_PROJECT }

    // Act
    const errors = validateProject(values)

    // Assert
    expect(errors).toMatchObject({
      coordinates: 'Confirma la ubicación en el mapa.',
      name: 'Escribe el nombre del proyecto.',
      kind: 'Elige qué tipo de proyecto es.',
      stage: 'Elige en qué etapa está.',
      priceFrom: 'Escribe el precio de la unidad más barata, en dólares.',
      models: 'Cada modelo necesita un nombre.',
      images: 'Agrega al menos una foto: la primera es la portada.',
    })
  })

  it('revisa cada modelo, el teléfono y el enlace del video', () => {
    // Arrange
    const values = filled({
      models: [
        { name: 'Modelo A', bedrooms: '2', bathrooms: '2', area: '85', priceFrom: '95000' },
        { name: 'Modelo B', bedrooms: '2.5', bathrooms: '', area: '90', priceFrom: '99000' },
      ],
      developerPhone: '123',
      videoUrl: 'youtube.com/x',
    })

    // Act
    const errors = validateProject(values)

    // Assert
    expect(errors.models).toBe('Las habitaciones son un número entero.')
    expect(errors.developerPhone).toBeTruthy()
    expect(errors.videoUrl).toBe('Pega el enlace completo del video, empezando por https://.')
  })
})

describe('toProjectSubmission', () => {
  it('entrega números como números, el teléfono completo, la entrega como fecha y las amenidades sin líneas vacías', () => {
    // Arrange
    const values = filled()

    // Act
    const submission = toProjectSubmission(values)

    // Assert
    expect(submission).toMatchObject({
      neighborhood: 'Colonia Trejo',
      developerPhone: '+50499998888',
      deliveryDate: '2027-12-01',
      priceFrom: 95000,
      unitsTotal: 40,
      models: [{ name: 'Modelo A', bedrooms: 2, area: 85, priceFrom: 95000 }],
      amenities: ['Piscina', 'Gimnasio'],
    })
    expect(submission.models[0]).not.toHaveProperty('bathrooms')
    expect(submission).not.toHaveProperty('videoUrl')
  })
})
