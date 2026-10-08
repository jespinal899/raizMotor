import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCouponCode } from '@/features/shop/hooks/useCouponCode'

const setup = () => renderHook(() => useCouponCode())

describe('useCouponCode', () => {
  it('empieza sin código y sin aviso', () => {
    // Arrange: espacio de cupones recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.code).toBe('')
    expect(result.current.error).toBeUndefined()
  })

  it.each([
    { code: '', error: 'Escribe el código de descuento.' },
    { code: '   ', error: 'Escribe el código de descuento.' },
    { code: 'PROMO10', error: 'Ese código de descuento no es válido.' },
  ])('al aplicar "$code" responde: $error', ({ code, error }) => {
    // Arrange
    const { result } = setup()
    act(() => result.current.change(code))

    // Act
    act(() => result.current.apply())

    // Assert
    expect(result.current.error).toBe(error)
  })

  it('al cambiar el código retira el aviso', () => {
    // Arrange
    const { result } = setup()
    act(() => result.current.change('PROMO10'))
    act(() => result.current.apply())

    // Act
    act(() => result.current.change('PROMO1'))

    // Assert
    expect(result.current.code).toBe('PROMO1')
    expect(result.current.error).toBeUndefined()
  })
})
