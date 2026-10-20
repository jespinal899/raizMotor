import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import { authService } from '@/features/auth/services/authService'
import { BRAND } from '@/shared/constants/brand'
import { buildAccount, buildAdminService, buildListing, buildProject, buildReport, pageOf } from '@/test/adminService'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

vi.mock('@/features/auth/services/authService', () => ({ authService: { onSessionChange: vi.fn() } }))

const ADMIN = buildSessionUser({ email: 'equipo@domusraiz.hn' })

const renderPage = (service = buildAdminService()) => {
  const view = renderWithRouter(<AdminDashboardPage service={service} />, { route: '/admin', path: '/admin' })

  return { ...view, service }
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.mocked(authService.onSessionChange).mockReset()
    sessionIs(ADMIN)
  })

  it('a una cuenta que no es del equipo le dice que no tiene acceso, sin mostrar nada del panel', async () => {
    // Arrange
    const service = buildAdminService({ isAdmin: vi.fn(async () => false) })

    // Act
    renderPage(service)

    // Assert
    expect(await screen.findByRole('heading', { name: 'No tienes acceso a esta página' })).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(service.listReports).not.toHaveBeenCalled()
  })

  it('si no pudo comprobar los permisos, lo dice en lugar de negar el acceso', async () => {
    // Arrange
    const service = buildAdminService({ isAdmin: vi.fn(async () => Promise.reject(new Error('Sin conexión'))) })

    // Act
    renderPage(service)

    // Assert
    expect(await screen.findByRole('heading', { name: 'No pudimos comprobar tus permisos' })).toBeInTheDocument()
  })

  it('a una cuenta del equipo le abre el panel en los reportes pendientes, y pone su título en la pestaña', async () => {
    // Arrange
    const service = buildAdminService({ listReports: vi.fn(async () => pageOf([buildReport()])) })

    // Act
    renderPage(service)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Panel de administración' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Reportes' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByText('Posible fraude o estafa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Casa amplia con patio en Palmira' })).toHaveAttribute('href', '/propiedad/anuncio-1')
    expect(service.listReports).toHaveBeenCalledWith('open', { page: 1, pageSize: 20 })
    await waitFor(() => expect(document.title).toBe(`Panel de administración | ${BRAND.name}`))
  })

  it('oculta el anuncio reportado tras confirmarlo, con la nota escrita, y vuelve a leer la lista', async () => {
    // Arrange
    const user = userEvent.setup()
    const listReports = vi
      .fn()
      .mockResolvedValueOnce(pageOf([buildReport()]))
      .mockResolvedValue(pageOf([]))
    const { service } = renderPage(buildAdminService({ listReports }))
    await user.click(await screen.findByRole('button', { name: 'Ocultar anuncio' }))
    const dialog = await screen.findByRole('dialog')

    // Act
    await user.type(within(dialog).getByRole('textbox', { name: /Nota para el registro/ }), '  Estafa confirmada ')
    await user.click(within(dialog).getByRole('button', { name: 'Ocultar anuncio' }))

    // Assert
    await waitFor(() => expect(service.reviewReport).toHaveBeenCalledExactlyOnceWith('reporte-1', 'hide_property', 'Estafa confirmada'))
    expect(await screen.findByText('No hay reportes pendientes.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('si la decisión no se pudo guardar, la ventana sigue abierta y lo dice', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService({
      listReports: vi.fn(async () => pageOf([buildReport()])),
      reviewReport: vi.fn(async () => Promise.reject(new Error('forbidden'))),
    })
    renderPage(service)
    await user.click(await screen.findByRole('button', { name: 'Descartar' }))
    const dialog = await screen.findByRole('dialog')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Descartar' }))

    // Assert
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos guardar la decisión')
    expect(service.reviewReport).toHaveBeenCalledWith('reporte-1', 'dismiss', '')
  })

  it('un reporte de un proyecto enlaza al proyecto y permite ocultarlo', async () => {
    // Arrange
    const user = userEvent.setup()
    const report = buildReport({ property: null, project: { id: 'proyecto-1', name: 'Torre Vista Lomas', status: 'published' } })
    const { service } = renderPage(buildAdminService({ listReports: vi.fn(async () => pageOf([report])) }))
    expect(await screen.findByRole('link', { name: 'Torre Vista Lomas' })).toHaveAttribute('href', '/proyectos/proyecto-1')

    // Act
    await user.click(screen.getByRole('button', { name: 'Ocultar proyecto' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ocultar proyecto' }))

    // Assert
    await waitFor(() => expect(service.reviewReport).toHaveBeenCalledExactlyOnceWith('reporte-1', 'hide_property', ''))
    expect(screen.queryByRole('button', { name: 'Ocultar anuncio' })).not.toBeInTheDocument()
  })

  it('en Proyectos oculta uno publicado y busca por nombre', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService({ listProjects: vi.fn(async () => pageOf([buildProject()])) })
    renderPage(service)
    await user.click(await screen.findByRole('tab', { name: 'Proyectos' }))

    // Act
    await user.type(await screen.findByRole('searchbox', { name: 'Buscar por nombre' }), 'Torre')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Ocultar' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ocultar' }))

    // Assert
    expect(service.listProjects).toHaveBeenCalledWith({ status: undefined, search: 'Torre' }, { page: 1, pageSize: 20 })
    await waitFor(() => expect(service.setProjectStatus).toHaveBeenCalledExactlyOnceWith('proyecto-1', 'hidden', ''))
  })

  it('en Proyectos un borrador de la inmobiliaria no se publica desde el panel', async () => {
    // Arrange
    const user = userEvent.setup()
    const draft = buildProject({ status: 'draft' })
    renderPage(buildAdminService({ listProjects: vi.fn(async () => pageOf([draft])) }))

    // Act
    await user.click(await screen.findByRole('tab', { name: 'Proyectos' }))

    // Assert
    expect(await screen.findByText('En borrador de la inmobiliaria')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Devolver al catálogo|Ocultar/ })).not.toBeInTheDocument()
  })

  it('en Anuncios filtra por estado y devuelve al catálogo uno que ocultó el equipo', async () => {
    // Arrange
    const user = userEvent.setup()
    const hidden = buildListing({ id: 'oculto', title: 'Terreno en Valle de Ángeles', status: 'hidden' })
    const service = buildAdminService({ listListings: vi.fn(async () => pageOf([hidden])) })
    renderPage(service)
    await user.click(await screen.findByRole('tab', { name: 'Anuncios' }))

    // Act
    await user.click(await screen.findByRole('button', { name: 'Ocultos' }))
    await user.click(await screen.findByRole('button', { name: 'Devolver al catálogo' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Devolver al catálogo' }))

    // Assert
    expect(service.listListings).toHaveBeenCalledWith({ status: 'hidden', search: '' }, { page: 1, pageSize: 20 })
    await waitFor(() => expect(service.setListingStatus).toHaveBeenCalledExactlyOnceWith('oculto', 'published', ''))
  })

  it('en Cuentas cambia el límite de anuncios de una cuenta al de un plan', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService({ listAccounts: vi.fn(async () => pageOf([buildAccount()])) })
    renderPage(service)
    await user.click(await screen.findByRole('tab', { name: 'Cuentas' }))
    await user.click(await screen.findByRole('button', { name: 'Cambiar límite' }))
    const dialog = await screen.findByRole('dialog')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Agente Pro (25)' }))
    await user.click(within(dialog).getByRole('button', { name: 'Cambiar límite' }))

    // Assert
    await waitFor(() => expect(service.setAccountLimits).toHaveBeenCalledExactlyOnceWith('cuenta-1', { publications: 25, projects: 0 }, ''))
  })

  it('en Cuentas activa un plan de inmobiliaria con sus dos límites: proyectos y anuncios', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService({ listAccounts: vi.fn(async () => pageOf([buildAccount()])) })
    renderPage(service)
    await user.click(await screen.findByRole('tab', { name: 'Cuentas' }))
    await user.click(await screen.findByRole('button', { name: 'Cambiar límite' }))
    const dialog = await screen.findByRole('dialog')

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Inmobiliaria Plus (3 + 150)' }))
    await user.click(within(dialog).getByRole('button', { name: 'Cambiar límite' }))

    // Assert
    await waitFor(() =>
      expect(service.setAccountLimits).toHaveBeenCalledExactlyOnceWith('cuenta-1', { publications: 150, projects: 3 }, ''),
    )
  })

  it('no deja guardar un límite que no es un número entero de 0 a 1000', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService({ listAccounts: vi.fn(async () => pageOf([buildAccount()])) })
    renderPage(service)
    await user.click(await screen.findByRole('tab', { name: 'Cuentas' }))
    await user.click(await screen.findByRole('button', { name: 'Cambiar límite' }))
    const dialog = await screen.findByRole('dialog')
    const limit = within(dialog).getByRole('spinbutton', { name: 'Anuncios publicados a la vez' })

    // Act
    await user.clear(limit)
    await user.type(limit, '1001')

    // Assert
    expect(within(dialog).getByText('Escribe un número entero de 0 a 1000.')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cambiar límite' })).toBeDisabled()
  })
})
