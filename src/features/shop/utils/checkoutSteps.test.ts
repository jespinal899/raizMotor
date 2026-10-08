import { describe, expect, it } from 'vitest'
import { CHECKOUT_STEPS, CHECKOUT_STEP_FIELDS } from '@/features/shop/utils/checkoutSteps'

describe('CHECKOUT_STEPS', () => {
  it('la contratación va en tres pasos: los datos, el pago y la confirmación', () => {
    // Arrange
    const expectedSteps = ['Tus datos', 'Pago', 'Confirmación']

    // Act
    const steps = CHECKOUT_STEPS

    // Assert
    expect(steps).toEqual(expectedSteps)
    expect(CHECKOUT_STEP_FIELDS).toHaveLength(expectedSteps.length)
  })

  it('el primer paso pide a la persona; el segundo, cómo paga; el tercero, aceptar los términos', () => {
    // Arrange
    const [person, payment, confirmation] = CHECKOUT_STEP_FIELDS

    // Act
    const fieldsByStep = { person, payment, confirmation }

    // Assert
    expect(fieldsByStep).toEqual({
      person: ['firstName', 'lastName', 'document', 'phone', 'email'],
      payment: ['paymentMethod'],
      confirmation: ['acceptsTerms'],
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
