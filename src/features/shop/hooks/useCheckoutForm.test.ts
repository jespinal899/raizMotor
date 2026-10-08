import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { useCheckoutForm } from '@/features/shop/hooks/useCheckoutForm'
import type { PlanRequestService } from '@/features/shop/services/planRequestService'
import type { CheckoutFormValues } from '@/features/shop/types/checkout.types'

const [PRO] = AGENT_PLANS
const CHAT_URL = 'https://wa.me/50489150271?text=solicitud'

const VALID: CheckoutFormValues = {
  firstName: '  Ana ',
  lastName: ' Mejía ',
  document: '0801-1990-12345',
  phone: '9999-9999',
  email: ' ana@gmail.com ',
  paymentMethod: 'tarjeta',
  acceptsTerms: true,
}

const setup = () => {
  const service: PlanRequestService = { open: vi.fn(() => CHAT_URL) }
  const view = renderHook(() => useCheckoutForm(PRO, service))

  return { service, ...view }
}

type Result = ReturnType<typeof setup>['result']

const fill = (result: Result, values: CheckoutFormValues = VALID) => {
  for (const field of Object.keys(values) as (keyof CheckoutFormValues)[]) {
    act(() => result.current.change(field, values[field]))
  }
}

describe('useCheckoutForm', () => {
  it('empieza vacío, sin forma de pago elegida, sin errores y sin chat abierto', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({
      firstName: '',
      lastName: '',
      document: '',
      phone: '',
      email: '',
      paymentMethod: '',
      acceptsTerms: false,
    })
    expect(result.current.errors).toEqual({})
    expect(result.current.chatUrl).toBeUndefined()
  })

  it('puede validar solo los datos de un paso', () => {
    // Arrange
    const { result } = setup()

    // Act
    let isValid = true
    act(() => {
      isValid = result.current.validate(['firstName', 'lastName'])
    })

    // Assert
    expect(isValid).toBe(false)
    expect(result.current.errors.firstName).toBe('Escribe tu nombre.')
    expect(result.current.errors.paymentMethod).toBeUndefined()
  })

  it('con datos que faltan no abre el chat y muestra los errores', () => {
    // Arrange
    const { result, service } = setup()

    // Act
    act(() => result.current.submit())

    // Assert
    expect(service.open).not.toHaveBeenCalled()
    expect(result.current.errors.lastName).toBe('Escribe tu apellido.')
    expect(result.current.errors.paymentMethod).toBe('Elige cómo quieres pagar.')
    expect(result.current.chatUrl).toBeUndefined()
  })

  it('con todo completo abre el chat del plan con los datos ya limpios y recuerda su dirección', () => {
    // Arrange
    const { result, service } = setup()
    fill(result)

    // Act
    act(() => result.current.submit())

    // Assert
    expect(service.open).toHaveBeenCalledExactlyOnceWith(PRO, {
      firstName: 'Ana',
      lastName: 'Mejía',
      document: '0801199012345',
      phone: '+50499999999',
      email: 'ana@gmail.com',
      paymentMethod: 'tarjeta',
    })
    expect(result.current.chatUrl).toBe(CHAT_URL)
  })

  it('al cambiar un dato olvida el chat abierto: su mensaje llevaba los datos anteriores', () => {
    // Arrange
    const { result } = setup()
    fill(result)
    act(() => result.current.submit())

    // Act
    act(() => result.current.change('paymentMethod', 'transferencia'))

    // Assert
    expect(result.current.chatUrl).toBeUndefined()
  })

  it('al corregir un campo quita solo su error', () => {
    // Arrange
    const { result } = setup()
    act(() => result.current.submit())

    // Act
    act(() => result.current.change('firstName', 'Ana'))

    // Assert
    expect(result.current.errors.firstName).toBeUndefined()
    expect(result.current.errors.email).toBe('Escribe tu correo.')
  })
})
