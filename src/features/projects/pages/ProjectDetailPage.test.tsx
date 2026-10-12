import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTS } from '@/features/projects/data/projects.data'
import ProjectDetailPage from '@/features/projects/pages/ProjectDetailPage'
import { projectService } from '@/features/projects/services/projectService'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/projects/services/projectService', () => ({ projectService: { getById: vi.fn() } }))

const getById = vi.mocked(projectService.getById)
const PATH = '/proyectos/:id'

const openProject = (id: string) => renderWithRouter(<ProjectDetailPage />, { route: `/proyectos/${id}`, path: PATH })

describe('ProjectDetailPage', () => {
  it('muestra el proyecto: etapa, entrega, modelos, amenidades y a quién pedir información', async () => {
    // Arrange
    const project = { ...PROJECTS[0], developer: { name: 'Constructora Real', phone: '+50499998888' }, example: false }
    getById.mockResolvedValue(project)

    // Act
    openProject(project.id)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: project.name })).toBeInTheDocument()
    expect(screen.getByText('Preventa')).toBeInTheDocument()
    expect(screen.getByText('diciembre de 2027')).toBeInTheDocument()
    const models = screen.getByRole('table')
    expect(models).toHaveTextContent('Modelo A')
    expect(models).toHaveTextContent(/132,000/)
    expect(screen.getByText('Gimnasio')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Pedir información por WhatsApp/ })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/50499998888'),
    )
  })

  it('sin teléfono de la desarrolladora, ofrece consultar al sitio', async () => {
    // Arrange
    getById.mockResolvedValue({ ...PROJECTS[1], example: true })

    // Act
    openProject(PROJECTS[1].id)

    // Assert
    expect(await screen.findByRole('link', { name: /Pedir información/ })).toHaveAttribute('href', '/contacto')
    expect(screen.getByText('Ejemplo')).toBeInTheDocument()
  })

  it('si el proyecto no existe, lo dice y lleva al catálogo', async () => {
    // Arrange
    getById.mockResolvedValue(undefined)

    // Act
    openProject('no-existe')

    // Assert
    expect(await screen.findByRole('heading', { name: 'Este proyecto ya no está disponible' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos los proyectos' })).toHaveAttribute('href', '/proyectos')
  })
})
