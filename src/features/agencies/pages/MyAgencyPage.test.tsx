import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MyAgencyPage from '@/features/agencies/pages/MyAgencyPage'
import { AgencySlugTakenError } from '@/features/agencies/services/agencyErrors'
import { createPendingAgencyService } from '@/features/agencies/services/agencyService'
import type { AgencyService } from '@/features/agencies/services/agencyService'
import type { Agency, AgencyProfile } from '@/features/agencies/types/agency.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const savedFrom = ({ logo: _logo, ...profile }: AgencyProfile): Agency => ({ ...profile, verified: false })

const serviceWith = (overrides: Partial<AgencyService>): AgencyService => ({ ...createPendingAgencyService(), ...overrides })

describe('MyAgencyPage', () => {
  it('sin plan de inmobiliaria, ofrece los planes', async () => {
    // Act
    renderWithRouter(<MyAgencyPage service={serviceWith({ getOwn: async () => ({ eligible: false }) })} />)

    // Assert
    expect(await screen.findByRole('link', { name: 'Ver los planes para inmobiliarias' })).toHaveAttribute(
      'href',
      '/planes/inmobiliarias',
    )
  })

  it('crea el perfil: la dirección sigue al nombre y los enlaces se guardan con https', async () => {
    // Arrange
    const user = userEvent.setup()
    const saveOwn = vi.fn(async (profile: AgencyProfile) => savedFrom(profile))
    renderWithRouter(<MyAgencyPage service={serviceWith({ getOwn: async () => ({ eligible: true }), saveOwn })} />)

    // Act
    await user.type(await screen.findByRole('textbox', { name: 'Nombre comercial' }), 'Casa Norte Bienes Raíces')
    await user.type(screen.getByRole('textbox', { name: /Sitio web/ }), 'www.casanorte.hn')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    // Assert
    await waitFor(() =>
      expect(saveOwn).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ name: 'Casa Norte Bienes Raíces', slug: 'casa-norte-bienes-raices', website: 'https://www.casanorte.hn' }),
      ),
    )
    expect(saveOwn.mock.calls[0][0]).not.toHaveProperty('logo')
    expect(await screen.findByRole('link', { name: 'Ver mi página' })).toHaveAttribute('href', '/inmobiliaria/casa-norte-bienes-raices')
  })

  it('si la dirección ya la usa otra inmobiliaria, lo explica', async () => {
    // Arrange
    const user = userEvent.setup()
    const saveOwn = vi.fn(async () => Promise.reject(new AgencySlugTakenError()))
    renderWithRouter(<MyAgencyPage service={serviceWith({ getOwn: async () => ({ eligible: true }), saveOwn })} />)

    // Act
    await user.type(await screen.findByRole('textbox', { name: 'Nombre comercial' }), 'Casa Norte')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    // Assert
    expect(await screen.findByText('Esa dirección ya la usa otra inmobiliaria')).toBeInTheDocument()
  })

  it('al editar, no cambia sola la dirección de un perfil ya guardado', async () => {
    // Arrange
    const user = userEvent.setup()
    const agency: Agency = { slug: 'casa-norte', name: 'Casa Norte', kind: 'inmobiliaria', verified: true, description: '' }
    const saveOwn = vi.fn(async (profile: AgencyProfile) => savedFrom(profile))
    renderWithRouter(<MyAgencyPage service={serviceWith({ getOwn: async () => ({ eligible: true, agency }), saveOwn })} />)

    // Act
    const name = await screen.findByRole('textbox', { name: 'Nombre comercial' })
    await user.type(name, ' SPS')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    // Assert
    await waitFor(() => expect(saveOwn).toHaveBeenCalledWith(expect.objectContaining({ name: 'Casa Norte SPS', slug: 'casa-norte' })))
  })
})
