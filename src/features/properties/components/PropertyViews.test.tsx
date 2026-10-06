import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PropertyViews from '@/features/properties/components/PropertyViews'
import type { PropertyViewService } from '@/features/properties/services/propertyViewService'

const serviceCounting = (views: number): PropertyViewService => ({ registerView: vi.fn(async () => views) })

describe('PropertyViews', () => {
  it('registra la visita a esta ficha y muestra cuántas lleva', async () => {
    // Arrange
    const service = serviceCounting(12)

    // Act
    render(<PropertyViews propertyId="casa-1" service={service} />)

    // Assert
    expect(await screen.findByText('12 vistas')).toBeInTheDocument()
    expect(service.registerView).toHaveBeenCalledExactlyOnceWith('casa-1')
  })

  it('aclara que el total es el de este navegador, no el de todos los visitantes', async () => {
    // Arrange
    const service = serviceCounting(12)

    // Act
    render(<PropertyViews propertyId="casa-1" service={service} />)

    // Assert
    expect(await screen.findByText(/en este navegador/)).toHaveTextContent('12 vistas en este navegador')
  })

  it('con una sola visita lo dice en singular', async () => {
    // Arrange
    const service = serviceCounting(1)

    // Act
    render(<PropertyViews propertyId="casa-1" service={service} />)

    // Assert
    expect(await screen.findByText('1 vista')).toBeInTheDocument()
  })

  it('separa los miles', async () => {
    // Arrange
    const service = serviceCounting(1250)

    // Act
    render(<PropertyViews propertyId="casa-1" service={service} />)

    // Assert
    expect(await screen.findByText('1,250 vistas')).toBeInTheDocument()
  })

  it('mientras no se sabe el total no muestra ninguna cifra', () => {
    // Arrange
    const service: PropertyViewService = { registerView: () => new Promise(() => {}) }

    // Act
    const { container } = render(<PropertyViews propertyId="casa-1" service={service} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('si no se pudo contar, no inventa una cifra', async () => {
    // Arrange
    const registerView = vi.fn(() => Promise.reject(new Error('almacenamiento bloqueado')))

    // Act
    const { container } = render(<PropertyViews propertyId="casa-1" service={{ registerView }} />)

    // Assert
    await waitFor(() => expect(registerView).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
