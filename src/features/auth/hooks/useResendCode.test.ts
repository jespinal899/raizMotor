import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RESEND_WAIT_SECONDS, useResendCode } from '@/features/auth/hooks/useResendCode'
import { CodeRequestTooSoonError } from '@/features/auth/services/authErrors'

describe('useResendCode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('si el código acaba de enviarse, espera un minuto antes de dejar pedir otro', async () => {
    // Arrange
    const onResend = vi.fn(async () => {})
    const { result } = renderHook(() => useResendCode({ onResend }))

    // Act
    await act(() => result.current.resend())

    // Assert
    expect(result.current.secondsLeft).toBe(RESEND_WAIT_SECONDS)
    expect(onResend).not.toHaveBeenCalled()
  })

  it('cuando pasa el minuto deja pedir otro, y vuelve a esperar', async () => {
    // Arrange
    const onResend = vi.fn(async () => {})
    const { result } = renderHook(() => useResendCode({ onResend }))
    for (let second = 0; second < RESEND_WAIT_SECONDS; second += 1) act(() => vi.advanceTimersByTime(1000))

    // Act
    await act(() => result.current.resend())

    // Assert
    expect(onResend).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('sent')
    expect(result.current.secondsLeft).toBe(RESEND_WAIT_SECONDS)
  })

  it('sin un código recién enviado deja pedir uno en el acto', async () => {
    // Arrange
    const onResend = vi.fn(async () => {})
    const { result } = renderHook(() => useResendCode({ onResend, justSent: false }))

    // Act
    await act(() => result.current.resend())

    // Assert
    expect(onResend).toHaveBeenCalledOnce()
  })

  it('si Supabase dice que es demasiado pronto, lo explica y vuelve a esperar', async () => {
    // Arrange
    const onResend = vi.fn(async () => Promise.reject(new CodeRequestTooSoonError()))
    const { result } = renderHook(() => useResendCode({ onResend, justSent: false }))

    // Act
    await act(() => result.current.resend())

    // Assert
    expect(result.current.status).toBe('tooSoon')
    expect(result.current.secondsLeft).toBe(RESEND_WAIT_SECONDS)
  })
})
