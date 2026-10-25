import { describe, expect, it } from 'vitest'
import { INSTALLED_APP_CLASS, markInstalledApp } from '@/lib/installedApp'

const safari = (standalone?: boolean) => ({ standalone }) as unknown as Navigator

describe('markInstalledApp', () => {
  it('abierta desde la pantalla de inicio del iPhone, lo marca en <html>', () => {
    // Arrange
    const root = document.createElement('html')

    // Act
    markInstalledApp(safari(true), root)

    // Assert
    expect(root).toHaveClass(INSTALLED_APP_CLASS)
  })

  it('en el navegador no marca nada', () => {
    // Arrange
    const root = document.createElement('html')

    // Act
    markInstalledApp(safari(false), root)
    markInstalledApp(safari(), root)

    // Assert
    expect(root).not.toHaveClass(INSTALLED_APP_CLASS)
  })
})
