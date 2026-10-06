import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'

const withBase = (basename: string) =>
  function Router({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter basename={basename} initialEntries={[`${basename}/propiedades`.replace('//', '/')]}>
        {children}
      </MemoryRouter>
    )
  }

describe('useAbsoluteUrl', () => {
  it('convierte una ruta de la aplicación en una dirección que se puede abrir desde fuera', () => {
    // Arrange
    const path = '/propiedad/casa-1'

    // Act
    const { result } = renderHook(() => useAbsoluteUrl(path), { wrapper: withBase('/') })

    // Assert
    expect(result.current).toBe(`${window.location.origin}/propiedad/casa-1`)
  })

  it('incluye el prefijo bajo el que está publicado el sitio', () => {
    // Arrange
    const path = '/propiedad/casa-1'

    // Act
    const { result } = renderHook(() => useAbsoluteUrl(path), { wrapper: withBase('/raizMotor') })

    // Assert
    expect(result.current).toBe(`${window.location.origin}/raizMotor/propiedad/casa-1`)
  })
})
