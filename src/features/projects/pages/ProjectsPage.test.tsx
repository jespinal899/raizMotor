import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PROJECTS } from '@/features/projects/data/projects.data'
import ProjectsPage from '@/features/projects/pages/ProjectsPage'
import { projectService } from '@/features/projects/services/projectService'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/projects/services/projectService', () => ({ projectService: { search: vi.fn() } }))

const search = vi.mocked(projectService.search)

const PATH = '/proyectos'

describe('ProjectsPage', () => {
  beforeEach(() => {
    search.mockReset()
    search.mockResolvedValue({ items: PROJECTS.slice(0, 2), total: 2, page: 1, pageSize: 9, totalPages: 1 })
  })

  it('lista los proyectos y cuántos hay', async () => {
    // Arrange: catálogo sin filtros

    // Act
    renderWithRouter(<ProjectsPage />, { route: PATH, path: PATH })

    // Assert
    expect(await screen.findByRole('link', { name: PROJECTS[0].name })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Proyectos' })).toBeInTheDocument()
    expect(screen.getByText('2 proyectos')).toBeInTheDocument()
  })

  it('busca con los filtros de la dirección', async () => {
    // Arrange
    const route = '/proyectos?etapa=preventa&zona=palmira&pagina=2'

    // Act
    renderWithRouter(<ProjectsPage />, { route, path: PATH })

    // Assert
    await screen.findByText('2 proyectos')
    expect(search).toHaveBeenCalledWith({ stage: 'preventa', location: 'palmira' }, { page: 2, pageSize: 9 })
  })

  it('buscar por zona lleva a la dirección con esa zona, desde la primera página', async () => {
    // Arrange
    const user = userEvent.setup()
    const { currentPath } = renderWithRouter(<ProjectsPage />, { route: '/proyectos?pagina=2', path: PATH })
    await screen.findByText('2 proyectos')

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Zona' }), 'Lomas')
    await user.click(screen.getByRole('button', { name: 'Buscar por zona' }))

    // Assert
    expect(currentPath()).toBe('/proyectos?zona=Lomas')
    expect(search).toHaveBeenLastCalledWith({ location: 'Lomas' }, { page: 1, pageSize: 9 })
  })

  it('sin resultados lo dice', async () => {
    // Arrange
    search.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 9, totalPages: 1 })

    // Act
    renderWithRouter(<ProjectsPage />, { route: PATH, path: PATH })

    // Assert
    expect(await screen.findByRole('heading', { name: 'No hay proyectos con esos filtros' })).toBeInTheDocument()
  })
})
