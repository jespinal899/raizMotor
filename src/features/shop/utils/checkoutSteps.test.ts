import { describe, expect, it } from 'vitest'
import { CHECKOUT_STEPS, CHECKOUT_STEP_FIELDS } from '@/features/shop/utils/checkoutSteps'

describe('CHECKOUT_STEPS', () => {
  it('la contratación va en tres pasos: los datos de suscripción, el resumen y el medio de pago', () => {
    // Arrange
    const expectedSteps = ['Datos de suscripción', 'Resumen', 'Medio de pago']

    // Act
    const steps = CHECKOUT_STEPS

    // Assert
    expect(steps).toEqual(expectedSteps)
    expect(CHECKOUT_STEP_FIELDS).toHaveLength(expectedSteps.length)
  })

  it('el primer paso pide a la persona; el resumen, aceptar los términos; el último, cómo paga', () => {
    // Arrange
    const [subscription, summary, payment] = CHECKOUT_STEP_FIELDS

    // Act
    const fieldsByStep = { subscription, summary, payment }

    // Assert
    expect(fieldsByStep).toEqual({
      subscription: ['firstName', 'lastName', 'document', 'phone', 'email'],
      summary: ['acceptsTerms'],
      payment: ['paymentMethod'],
    })
  })

  it('ningún dato se pide en dos pasos', () => {
    // Arrange
    const allFields = CHECKOUT_STEP_FIELDS.flat()

    // Act
    const distinct = new Set(allFields)

    // Assert
    expect(distinct.size).toBe(allFields.length)
  })
})
