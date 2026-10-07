import { describe, expect, it } from 'vitest'
import { buildPlanTopic, buildPropertyTopic } from '@/features/contact/utils/contactTopic'
import { PLANS } from '@/features/shop/data/plans.data'
import { buildProperty } from '@/test/factories'

describe('buildPropertyTopic', () => {
  it('describe la propiedad y propone una descripción que la menciona', () => {
    // Arrange
    const property = buildProperty({ id: 'casa-1', title: 'Casa con jardín', district: 'Barranco', city: 'Lima' })
    const reference = 'https://ejemplo.test/propiedad/casa-1'

    // Act
    const topic = buildPropertyTopic(property, reference)

    // Assert
    expect(topic).toEqual({
      id: 'propiedad:casa-1',
      label: 'Consulta sobre la propiedad',
      title: 'Casa con jardín',
      detail: 'Barranco, Lima',
      defaultDescription: 'Me interesa la propiedad "Casa con jardín" en Barranco, Lima. ¿Sigue disponible?',
      reference,
    })
  })
})

describe('buildPlanTopic', () => {
  it('describe el plan y propone una descripción que lo menciona, sin referencia', () => {
    // Arrange
    const plan = PLANS.find(({ id }) => id === 'inmobiliaria')!

    // Act
    const topic = buildPlanTopic(plan)

    // Assert
    expect(topic).toMatchObject({
      id: 'plan:inmobiliaria',
      label: 'Consulta sobre el plan',
      title: 'Inmobiliarias',
      defaultDescription: 'Me interesa el plan Inmobiliarias. ¿Me pueden dar más información?',
    })
    expect(topic.reference).toBeUndefined()
  })

  it('distingue cada motivo con un identificador propio', () => {
    // Arrange
    const property = buildProperty({ id: 'inmobiliaria' })
    const plan = PLANS.find(({ id }) => id === 'inmobiliaria')!

    // Act
    const ids = [buildPropertyTopic(property, '').id, buildPlanTopic(plan).id]

    // Assert
    expect(new Set(ids).size).toBe(2)
  })
})
