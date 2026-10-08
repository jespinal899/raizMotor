import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCardPaymentDemo } from '@/features/shop/hooks/useCardPaymentDemo'

const setup = () => renderHook(() => useCardPaymentDemo())

type Result = ReturnType<typeof setup>['result']

const fillCard = (result: Result) => {
  act(() => result.current.change('number', '4242424242424242'))
  act(() => result.current.change('expiry', '1230'))
  act(() => result.current.change('securityCode', '123'))
  act(() => result.current.change('holder', 'Ana Mejía'))
}

describe('useCardPaymentDemo', () => {
  it('empieza con la tarjeta vacía, sin errores y sin pago de muestra', () => {
    // Arrange: pantalla de pago recién abierta

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ number: '', expiry: '', securityCode: '', holder: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.isPaid).toBe(false)
  })

  it('da formato a lo que se escribe: el número en grupos y el vencimiento como mes y año', () => {
    // Arrange
    const { result } = setup()

    // Act
    fillCard(result)

    // Assert
    expect(result.current.values).toEqual({
      number: '4242 4242 4242 4242',
      expiry: '12/30',
      securityCode: '123',
      holder: 'Ana Mejía',
    })
  })

  it('con datos que faltan no da el pago de muestra por hecho y señala los errores', () => {
    // Arrange
    const { result } = setup()

    // Act
    let wasPaid = true
    act(() => {
      wasPaid = result.current.pay()
    })

    // Assert
    expect(wasPaid).toBe(false)
    expect(result.current.isPaid).toBe(false)
    expect(result.current.errors.number).toBe('Escribe los 16 dígitos de la tarjeta.')
  })

  it('con la tarjeta completa pasa a la confirmación de muestra', () => {
    // Arrange
    const { result } = setup()
    fillCard(result)

    // Act
    let wasPaid = false
    act(() => {
      wasPaid = result.current.pay()
    })

    // Assert
    expect(wasPaid).toBe(true)
    expect(result.current.isPaid).toBe(true)
  })
})
