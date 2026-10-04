import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LazyPublishPropertyPage from '@/features/properties/pages/LazyPublishPropertyPage'
// La página se importa aquí para que ya esté cargada: lo que se prueba es el marcador de espera,
// no cuánto tarda el entorno de pruebas en preparar todos sus archivos.
import '@/features/properties/pages/PublishPropertyPage'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))

describe('LazyPublishPropertyPage', () => {
  it('mientras se descarga la página muestra un marcador de carga y después el formulario', async () => {
    // Arrange
    vi.mocked(createLeafletLocationMap).mockImplementation(buildFakeLocationMap().createMap)

    // Act
    renderWithRouter(<LazyPublishPropertyPage />, { route: '/publicar' })

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Publica tu propiedad' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Cargando página')).not.toBeInTheDocument()
  })
})
