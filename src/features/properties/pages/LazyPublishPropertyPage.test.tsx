import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LazyPublishPropertyPage from '@/features/properties/pages/LazyPublishPropertyPage'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))

/** La primera importación de la página tarda más que el segundo que se espera por defecto. */
const IMPORT_WAIT = { timeout: 4000 }

describe('LazyPublishPropertyPage', () => {
  it('mientras se descarga la página muestra un marcador de carga y después el formulario', async () => {
    // Arrange
    vi.mocked(createLeafletLocationMap).mockImplementation(buildFakeLocationMap().createMap)

    // Act
    renderWithRouter(<LazyPublishPropertyPage />, { route: '/publicar' })

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
    const heading = await screen.findByRole('heading', { level: 1, name: 'Publica tu propiedad' }, IMPORT_WAIT)
    expect(heading).toBeInTheDocument()
    expect(screen.queryByLabelText('Cargando página')).not.toBeInTheDocument()
  })
})
