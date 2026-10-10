import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeaturedProperties from '@/features/home/components/FeaturedProperties'
import { buildProperty, buildPropertyService } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('FeaturedProperties', () => {
  it('muestra las propiedades destacadas', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', title: 'Casa con jardín en Tegucigalpa' })
    const service = buildPropertyService({ getFeatured: vi.fn(async () => [featured]) })

    // Act
    renderWithRouter(<FeaturedProperties service={service} />)

    // Assert
    expect(await screen.findByText('Casa con jardín en Tegucigalpa')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Propiedades destacadas' })).toBeInTheDocument()
  })

  it('sin destacadas no deja un título sobre un hueco', async () => {
    // Arrange
    const service = buildPropertyService({ getFeatured: vi.fn(async () => []) })

    // Act
    renderWithRouter(<FeaturedProperties service={service} />)

    // Assert
    await waitFor(() => expect(service.getFeatured).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Propiedades destacadas' })).not.toBeInTheDocument())
  })

  it('si no se pudieron cargar, lo dice', async () => {
    // Arrange
    const service = buildPropertyService({ getFeatured: vi.fn(async () => Promise.reject(new Error('Sin conexión'))) })

    // Act
    renderWithRouter(<FeaturedProperties service={service} />)

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar las propiedades.')
  })
})
