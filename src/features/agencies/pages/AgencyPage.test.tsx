import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AgencyPage from '@/features/agencies/pages/AgencyPage'
import { createPendingAgencyService } from '@/features/agencies/services/agencyService'
import type { AgencyService } from '@/features/agencies/services/agencyService'
import type { Agency } from '@/features/agencies/types/agency.types'
import type { ProjectService } from '@/features/projects/services/projectService'
import { buildProperty, buildPropertyService } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const OWNER = 'cuenta-casa-norte'

const AGENCY: Agency = {
  slug: 'casa-norte',
  name: 'Casa Norte',
  kind: 'inmobiliaria',
  logoUrl: 'https://logos.example/casa-norte.webp',
  verified: true,
  description: 'Casas y apartamentos en San Pedro Sula.',
  city: 'San Pedro Sula',
  phone: '+50499998888',
  website: 'https://casanorte.hn',
}

const projectsWith = (getByOwner: ProjectService['getByOwner']): ProjectService => ({
  getFeatured: vi.fn(),
  search: vi.fn(),
  getById: vi.fn(),
  getByOwner: vi.fn(getByOwner),
})

const renderPage = (agencies: AgencyService, properties = buildPropertyService(), projects = projectsWith(async () => [])) =>
  renderWithRouter(<AgencyPage agencies={agencies} properties={properties} projects={projects} />, {
    route: '/inmobiliaria/casa-norte',
    path: '/inmobiliaria/:slug',
  })

describe('AgencyPage', () => {
  it('muestra el perfil de la inmobiliaria, cómo escribirle y lo que tiene publicado', async () => {
    // Arrange
    const agencies: AgencyService = { ...createPendingAgencyService(), getPage: vi.fn(async () => ({ agency: AGENCY, ownerId: OWNER })) }
    const properties = buildPropertyService({
      getByOwner: vi.fn(async () => [buildProperty({ id: 'casa-1', title: 'Casa en Jardines del Valle' })]),
    })

    // Act
    renderPage(agencies, properties)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Casa Norte' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Logo de Casa Norte' })).toHaveAttribute('src', AGENCY.logoUrl)
    expect(screen.getByText('Verificada')).toBeInTheDocument()
    expect(screen.getByText('Casas y apartamentos en San Pedro Sula.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Escribir por WhatsApp/ })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/50499998888'),
    )
    expect(screen.getByRole('link', { name: /Sitio web/ })).toHaveAttribute('href', 'https://casanorte.hn')
    expect(screen.getByRole('link', { name: 'Casa en Jardines del Valle' })).toBeInTheDocument()
    expect(properties.getByOwner).toHaveBeenCalledExactlyOnceWith(OWNER)
    // Sin proyectos publicados, la sección no aparece.
    expect(screen.queryByRole('heading', { name: /Proyectos/ })).not.toBeInTheDocument()
  })

  it('si la inmobiliaria no existe o ya no tiene plan, lo dice', async () => {
    // Act
    renderPage(createPendingAgencyService())

    // Assert
    expect(await screen.findByRole('heading', { name: 'Esta inmobiliaria no está disponible' })).toBeInTheDocument()
  })
})
