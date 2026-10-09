import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanUsageBanner from '@/features/shop/components/PlanUsageBanner'
import { renderWithRouter } from '@/test/renderWithRouter'

const renderBanner = (published: number, limit: number) => {
  renderWithRouter(<PlanUsageBanner published={published} limit={limit} />)

  return within(screen.getByRole('region', { name: 'Tu plan activo' }))
}

describe('PlanUsageBanner', () => {
  it('dice el plan gratuito por su nombre y que es gratis', () => {
    // Arrange
    const freeLimit = 1

    // Act
    const banner = renderBanner(0, freeLimit)

    // Assert
    expect(banner.getByText('Propietario')).toBeInTheDocument()
    expect(banner.getByText('Gratis')).toBeInTheDocument()
  })

  it.each([
    { limit: 25, name: 'Agente Pro' },
    { limit: 100, name: 'Agente Élite' },
    { limit: 40, name: 'Plan a medida' },
  ])('con un plan de $limit publicaciones dice «$name», sin llamarlo gratis', ({ limit, name }) => {
    // Arrange
    const published = 2

    // Act
    const banner = renderBanner(published, limit)

    // Assert
    expect(banner.getByText(name)).toBeInTheDocument()
    expect(banner.queryByText('Gratis')).not.toBeInTheDocument()
  })

  it('la barra dice cuántas publicaciones activas hay de las que admite el plan', () => {
    // Arrange
    const published = 3
    const limit = 25

    // Act
    const banner = renderBanner(published, limit)

    // Assert
    const bar = banner.getByRole('progressbar', { name: 'Publicaciones activas' })
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '25')
    expect(bar).toHaveAttribute('aria-valuetext', '3 de 25')
    expect(banner.getByText('3/25')).toBeInTheDocument()
  })

  it('sin ninguna publicada, la barra empieza en cero', () => {
    // Arrange
    const published = 0

    // Act
    const banner = renderBanner(published, 1)

    // Assert
    expect(banner.getByRole('progressbar', { name: 'Publicaciones activas' })).toHaveAttribute('aria-valuenow', '0')
    expect(banner.getByText('0/1')).toBeInTheDocument()
  })

  it('con lugar libre dice cuántas caben todavía y ofrece publicar', () => {
    // Arrange
    const published = 3
    const limit = 25

    // Act
    const banner = renderBanner(published, limit)

    // Assert
    expect(banner.getByText('Puedes publicar 22 más.')).toBeInTheDocument()
    expect(banner.getByRole('link', { name: 'Publicar una propiedad' })).toHaveAttribute('href', '/publicar')
    expect(banner.queryByRole('link', { name: 'Ver planes' })).not.toBeInTheDocument()
  })

  it('con el plan completo lo dice, explica cómo hacer lugar y ofrece ver los planes', () => {
    // Arrange
    const published = 1
    const limit = 1

    // Act
    const banner = renderBanner(published, limit)

    // Assert
    expect(banner.getByText(/^Tu plan está completo\./)).toHaveTextContent('despublica o elimina una, o cambia de plan')
    expect(banner.getByRole('link', { name: 'Ver planes' })).toHaveAttribute('href', '/planes')
    expect(banner.queryByRole('link', { name: 'Publicar una propiedad' })).not.toBeInTheDocument()
  })

  it('si la cuenta tiene más publicadas de las que su plan admite, lo dice sin que la barra se desborde', () => {
    // Arrange
    const published = 3
    const limit = 1

    // Act
    const banner = renderBanner(published, limit)

    // Assert
    expect(banner.getByText('3/1')).toBeInTheDocument()
    expect(banner.getByRole('progressbar', { name: 'Publicaciones activas' })).toHaveAttribute('aria-valuenow', '1')
    expect(banner.getByRole('link', { name: 'Ver planes' })).toBeInTheDocument()
  })
})
