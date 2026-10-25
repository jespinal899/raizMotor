import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTS } from '@/features/projects/data/projects.data'
import type { MyProjectsService } from '@/features/projects/services/myProjectsService'
import type { PublicationService } from '@/features/properties/services/publicationService'
import MyPlanPage from '@/pages/MyPlanPage'
import { BRAND } from '@/shared/constants/brand'
import { fakeAuthService } from '@/test/fakeAuthService'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

interface Account {
  propertyLimit: number
  publishedProperties?: number
  projectLimit?: number
  publishedProjects?: number
}

const publicationsOf = ({ propertyLimit, publishedProperties = 0 }: Account) =>
  ({
    getLimit: vi.fn(async () => propertyLimit),
    listPublished: vi.fn(async () => Array.from({ length: publishedProperties }, (_, index) => `anuncio-${index}`)),
  }) as unknown as PublicationService

const projectsOf = ({ projectLimit = 0, publishedProjects = 0 }: Account) =>
  ({
    getLimit: vi.fn(async () => projectLimit),
    listOwn: vi.fn(async () => [
      ...Array.from({ length: publishedProjects }, () => ({ ...PROJECTS[0], status: 'published' as const })),
      { ...PROJECTS[0], status: 'draft' as const },
    ]),
  }) as unknown as MyProjectsService

/** Abre «Publicar» con la sesión de una cuenta con ese plan, o sin sesión. */
const openWith = (account: Account | null) => {
  const { service } = fakeAuthService(account ? buildSessionUser() : null)
  const plan = account ?? { propertyLimit: 1 }

  return renderWithRouter(<MyPlanPage auth={service} publications={publicationsOf(plan)} projects={projectsOf(plan)} />, {
    route: '/mi-plan',
  })
}

const allPlansHeading = () => screen.findByRole('heading', { level: 1, name: /Publica tu propiedad en/ })
const activePlan = async () => within(await screen.findByRole('region', { name: 'Tu plan activo' }))

describe('MyPlanPage', () => {
  it('sin sesión muestra todos los planes', async () => {
    // Arrange: visitante sin sesión

    // Act
    openWith(null)

    // Assert
    expect(await allPlansHeading()).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).map(({ textContent }) => textContent)).toEqual([
      'Propietario',
      'Agente inmobiliario',
      'Inmobiliarias',
    ])
  })

  it('con el plan gratuito (propietario) muestra todos los planes', async () => {
    // Arrange
    const owner = { propertyLimit: 1, publishedProperties: 1 }

    // Act
    openWith(owner)

    // Assert
    expect(await allPlansHeading()).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Tu plan activo' })).not.toBeInTheDocument()
  })

  it('con un plan de agente muestra el suyo y publicar una propiedad, sin hacerle elegir plan otra vez', async () => {
    // Arrange
    const agent = { propertyLimit: 25, publishedProperties: 3 }

    // Act
    openWith(agent)

    // Assert
    expect((await activePlan()).getByText('Agente Pro')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Tu plan' })).toBeInTheDocument()
    expect(screen.getByText(/3 de 25 publicados/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Publicar una propiedad' })).toHaveAttribute('href', '/publicar')
    expect(screen.queryByRole('link', { name: 'Publicar un proyecto' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Publica tu propiedad en/)).not.toBeInTheDocument()
    expect(document.title).toBe(`Tu plan | ${BRAND.name}`)
  })

  it('un agente mejora su plan entre los planes de agente', async () => {
    // Arrange
    const agent = { propertyLimit: 25 }

    // Act
    openWith(agent)

    // Assert
    expect((await activePlan()).getByRole('link', { name: 'Mejorar mi plan' })).toHaveAttribute(
      'href',
      '/planes/agente-inmobiliario',
    )
  })

  it('con un plan de inmobiliaria ofrece publicar una propiedad o un proyecto, y mejorar entre los de inmobiliaria', async () => {
    // Arrange
    const agency = { propertyLimit: 150, publishedProperties: 10, projectLimit: 3, publishedProjects: 1 }

    // Act
    openWith(agency)

    // Assert
    const plan = await activePlan()
    expect(plan.getByText('Inmobiliaria Plus')).toBeInTheDocument()
    expect(plan.getByRole('link', { name: 'Mejorar mi plan' })).toHaveAttribute('href', '/planes/inmobiliarias')
    expect(screen.getByRole('link', { name: 'Publicar una propiedad' })).toHaveAttribute('href', '/publicar')
    expect(screen.getByRole('link', { name: 'Publicar un proyecto' })).toHaveAttribute(
      'href',
      '/mis-publicaciones/proyectos/nuevo',
    )
    expect(screen.getByText(/1 de 3 publicados/)).toBeInTheDocument()
  })

  it('un plan a medida, acordado con el equipo, también es de pago', async () => {
    // Arrange
    const custom = { propertyLimit: 40, projectLimit: 2 }

    // Act
    openWith(custom)

    // Assert
    expect((await activePlan()).getByText('Plan a medida')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Publicar un proyecto' })).toBeInTheDocument()
  })

  it('con el plan completo no ofrece publicar otro: dice cómo hacer lugar', async () => {
    // Arrange
    const full = { propertyLimit: 25, publishedProperties: 25 }

    // Act
    openWith(full)

    // Assert
    expect(await screen.findByText(/Tu plan está completo/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publicar una propiedad' })).not.toBeInTheDocument()
    expect((await activePlan()).getByRole('link', { name: 'Mejorar mi plan' })).toBeInTheDocument()
  })

  it('si no se pudo leer el plan, muestra todos los planes en lugar de un error', async () => {
    // Arrange
    const { service } = fakeAuthService(buildSessionUser())
    const failing = { getLimit: vi.fn(async () => Promise.reject(new Error('sin conexión'))), listPublished: vi.fn(async () => []) }

    // Act
    renderWithRouter(
      <MyPlanPage auth={service} publications={failing as unknown as PublicationService} projects={null} />,
      { route: '/mi-plan' },
    )

    // Assert
    expect(await allPlansHeading()).toBeInTheDocument()
  })
})
