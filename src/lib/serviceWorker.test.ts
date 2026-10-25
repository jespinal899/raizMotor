import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from '@/lib/serviceWorker'

const fakeContainer = () => ({ register: vi.fn().mockResolvedValue({}) }) as unknown as ServiceWorkerContainer

describe('registerServiceWorker', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('en el sitio compilado registra el trabajador al terminar de cargar la página', () => {
    // Arrange
    const container = fakeContainer()

    // Act
    registerServiceWorker(container, true)
    window.dispatchEvent(new Event('load'))

    // Assert
    expect(container.register).toHaveBeenCalledWith('/sw.js')
  })

  it('en desarrollo no lo registra', () => {
    // Arrange
    const container = fakeContainer()

    // Act
    registerServiceWorker(container, false)
    window.dispatchEvent(new Event('load'))

    // Assert
    expect(container.register).not.toHaveBeenCalled()
  })

  it('sin soporte del navegador no hace nada', () => {
    // Arrange
    const listen = vi.spyOn(window, 'addEventListener')

    // Act
    registerServiceWorker(undefined, true)

    // Assert
    expect(listen).not.toHaveBeenCalled()
  })
})
