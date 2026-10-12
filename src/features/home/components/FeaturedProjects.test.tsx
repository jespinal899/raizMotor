import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeaturedProjects from '@/features/home/components/FeaturedProjects'
import { PROJECTS } from '@/features/projects/data/projects.data'
import type { ProjectService } from '@/features/projects/services/projectService'
import { renderWithRouter } from '@/test/renderWithRouter'

const serviceWith = (getFeatured: ProjectService['getFeatured']): ProjectService => ({
  getFeatured: vi.fn(getFeatured),
  search: vi.fn(),
  getById: vi.fn(),
})

describe('FeaturedProjects', () => {
  it('muestra los proyectos destacados, con un enlace al catálogo de proyectos', async () => {
    // Arrange
    const service = serviceWith(async () => [{ ...PROJECTS[0], featured: true }])

    // Act
    renderWithRouter(<FeaturedProjects service={service} />)

    // Assert
    expect(await screen.findByRole('link', { name: PROJECTS[0].name })).toHaveAttribute('href', `/proyectos/${PROJECTS[0].id}`)
    expect(screen.getByRole('heading', { name: 'Proyectos en preventa' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver todos los proyectos/ })).toHaveAttribute('href', '/proyectos')
    expect(screen.getByText('Destacado')).toBeInTheDocument()
  })

  it('sin destacados no deja un título sobre un hueco', async () => {
    // Arrange
    const service = serviceWith(async () => [])

    // Act
    renderWithRouter(<FeaturedProjects service={service} />)

    // Assert
    await waitFor(() => expect(service.getFeatured).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Proyectos en preventa' })).not.toBeInTheDocument())
  })

  it('si no se pudieron cargar, lo dice', async () => {
    // Arrange
    const service = serviceWith(async () => Promise.reject(new Error('Sin conexión')))

    // Act
    renderWithRouter(<FeaturedProjects service={service} />)

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los proyectos')
  })
})
