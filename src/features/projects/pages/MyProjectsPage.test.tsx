import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTS } from '@/features/projects/data/projects.data'
import MyProjectsPage from '@/features/projects/pages/MyProjectsPage'
import type { MyProjectsService } from '@/features/projects/services/myProjectsService'
import type { Project } from '@/features/projects/types/project.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const serviceWith = (own: Project[], limit: number): MyProjectsService => ({
  listOwn: vi.fn(async () => own),
  getLimit: vi.fn(async () => limit),
  getForEdit: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  unpublish: vi.fn(async () => {}),
  republish: vi.fn(async () => {}),
  remove: vi.fn(async () => {}),
})

const renderPage = (service: MyProjectsService | null) =>
  renderWithRouter(<MyProjectsPage service={service} />, { route: '/mis-publicaciones/proyectos' })

describe('MyProjectsPage', () => {
  it('sin plan de inmobiliaria invita a contratar uno, sin ofrecer publicar', async () => {
    // Arrange
    const service = serviceWith([], 0)

    // Act
    renderPage(service)

    // Assert
    expect(await screen.findByRole('heading', { name: 'Publica proyectos con un plan de inmobiliaria' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver los planes para inmobiliarias' })).toHaveAttribute('href', '/planes/inmobiliarias')
    expect(screen.queryByRole('link', { name: /Publicar un proyecto/ })).not.toBeInTheDocument()
  })

  it('con lugar en el plan ofrece publicar, y muestra cuántos tiene publicados de los que admite', async () => {
    // Arrange
    const service = serviceWith([{ ...PROJECTS[0], status: 'published' }], 3)

    // Act
    renderPage(service)

    // Assert
    expect(await screen.findByText('1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Publicar un proyecto/ })).toHaveAttribute('href', '/mis-publicaciones/proyectos/nuevo')
    expect(screen.getByRole('link', { name: /Editar/ })).toHaveAttribute('href', `/mis-publicaciones/proyectos/${PROJECTS[0].id}/editar`)
  })

  it('con el plan completo no ofrece publicar otro, sino ver los planes', async () => {
    // Arrange
    const service = serviceWith([{ ...PROJECTS[0], status: 'published' }], 1)

    // Act
    renderPage(service)

    // Assert
    expect(await screen.findByRole('link', { name: /Tu plan está completo/ })).toHaveAttribute('href', '/planes/inmobiliarias')
    expect(screen.queryByRole('link', { name: /Publicar un proyecto/ })).not.toBeInTheDocument()
  })

  it('despublicar un proyecto lo marca como despublicado y ofrece volver a publicarlo', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = serviceWith([{ ...PROJECTS[0], status: 'published' }], 3)
    renderPage(service)

    // Act
    await user.click(await screen.findByRole('button', { name: 'Despublicar' }))

    // Assert
    expect(service.unpublish).toHaveBeenCalledExactlyOnceWith(PROJECTS[0].id)
    expect(await screen.findByText('Despublicado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver a publicar' })).toBeInTheDocument()
  })

  it('eliminar pide confirmarlo y retira el proyecto de la lista', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = serviceWith([{ ...PROJECTS[0], status: 'draft' }], 3)
    renderPage(service)

    // Act
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar publicación' }))

    // Assert
    expect(service.remove).toHaveBeenCalledExactlyOnceWith(PROJECTS[0].id)
    expect(await screen.findByRole('heading', { name: 'Todavía no tienes proyectos' })).toBeInTheDocument()
  })

  it('enlaza las dos partes de «Mis publicaciones»', async () => {
    // Arrange
    const service = serviceWith([], 1)

    // Act
    renderPage(service)

    // Assert
    const nav = await screen.findByRole('navigation', { name: 'Mis publicaciones' })
    expect(within(nav).getByRole('link', { name: 'Propiedades' })).toHaveAttribute('href', '/mis-publicaciones')
    expect(within(nav).getByRole('link', { name: 'Proyectos' })).toHaveAttribute('aria-current', 'page')
  })

  it('sin las cuentas del sitio dice que aún no está disponible', () => {
    // Arrange: compilación sin Supabase

    // Act
    renderPage(null)

    // Assert
    expect(screen.getByRole('heading', { name: 'Los proyectos aún no están disponibles' })).toBeInTheDocument()
  })
})
