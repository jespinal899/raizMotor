import { act, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useClipboardCopy } from '@/hooks/useClipboardCopy'

const LINK = 'https://ejemplo.hn/propiedad/casa-1'

describe('useClipboardCopy', () => {
  beforeEach(() => {
    // jsdom no trae portapapeles: user-event instala uno de prueba.
    userEvent.setup()
  })

  it('empieza sin haber copiado nada', () => {
    // Arrange: enlace listo para copiar

    // Act
    const { result } = renderHook(() => useClipboardCopy(LINK))

    // Assert
    expect(result.current.status).toBe('idle')
  })

  it('copia el texto al portapapeles y lo confirma', async () => {
    // Arrange
    const { result } = renderHook(() => useClipboardCopy(LINK))

    // Act
    await act(() => result.current.copy())

    // Assert
    expect(await navigator.clipboard.readText()).toBe(LINK)
    expect(result.current.status).toBe('copied')
  })

  it('copiar otra vez deja lo mismo en el portapapeles', async () => {
    // Arrange
    const { result } = renderHook(() => useClipboardCopy(LINK))
    await act(() => result.current.copy())

    // Act
    await act(() => result.current.copy())

    // Assert
    expect(await navigator.clipboard.readText()).toBe(LINK)
    expect(result.current.status).toBe('copied')
  })

  it('si el navegador no deja copiar, lo indica en lugar de darlo por copiado', async () => {
    // Arrange
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Sin permiso', 'NotAllowedError'))
    const { result } = renderHook(() => useClipboardCopy(LINK))

    // Act
    await act(() => result.current.copy())

    // Assert
    expect(result.current.status).toBe('failed')
  })

  it('si el navegador no tiene portapapeles, lo indica sin romperse', async () => {
    // Arrange
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue(undefined as unknown as Clipboard)
    const { result } = renderHook(() => useClipboardCopy(LINK))

    // Act
    await act(() => result.current.copy())

    // Assert
    expect(result.current.status).toBe('failed')
  })
})
