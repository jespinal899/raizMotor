import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AgencyPlansPage from '@/features/shop/pages/AgencyPlansPage'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('AgencyPlansPage', () => {
  it('ofrece los tres planes de inmobiliaria con su precio y lo que incluyen, y cómo contratar cada uno', () => {
    // Arrange: visitante en los planes de inmobiliaria

    // Act
    renderWithRouter(<AgencyPlansPage />)

    // Assert
    for (const name of ['Inmobiliaria Inicial', 'Inmobiliaria Plus', 'Inmobiliaria Corporativa']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(document.body).toHaveTextContent(/Hasta 3 proyectos activos/)
    expect(screen.getByRole('link', { name: /Comenzar con Plus/ })).toHaveAttribute(
      'href',
      '/planes/inmobiliarias/contratar/inmobiliaria-plus',
    )
  })
})
