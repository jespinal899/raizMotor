import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AdminAgenciesTable from '@/features/admin/components/AdminAgenciesTable'
import type { AdminAgency } from '@/features/admin/types/admin.types'
import { buildAdminService } from '@/test/adminService'
import { buildPage } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const AGENCY: AdminAgency = {
  ownerId: 'cuenta-casa-norte',
  slug: 'casa-norte',
  name: 'Casa Norte',
  kind: 'inmobiliaria',
  city: 'San Pedro Sula',
  phone: '+50499998888',
  email: 'ventas@casanorte.hn',
  website: '',
  verified: false,
  createdAt: '2026-10-29T09:00:00.000Z',
}

describe('AdminAgenciesTable', () => {
  it('verifica una inmobiliaria con la nota del equipo y vuelve a leer la lista', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService({ listAgencies: vi.fn(async () => buildPage([AGENCY])) })
    renderWithRouter(<AdminAgenciesTable service={service} />)

    // Act
    expect(await screen.findByRole('link', { name: 'Casa Norte' })).toHaveAttribute('href', '/inmobiliaria/casa-norte')
    await user.click(screen.getByRole('button', { name: 'Verificar' }))
    await user.type(await screen.findByRole('textbox', { name: /Nota/ }), 'RTN revisado')
    const confirm = screen.getAllByRole('button', { name: 'Verificar' }).at(-1)!
    await user.click(confirm)

    // Assert
    await waitFor(() => expect(service.setAgencyVerified).toHaveBeenCalledExactlyOnceWith('cuenta-casa-norte', true, 'RTN revisado'))
    await waitFor(() => expect(service.listAgencies).toHaveBeenCalledTimes(2))
  })

  it('filtra las que faltan por verificar', async () => {
    // Arrange
    const user = userEvent.setup()
    const service = buildAdminService()
    renderWithRouter(<AdminAgenciesTable service={service} />)

    // Act
    await user.click(await screen.findByRole('button', { name: 'Sin verificar' }))

    // Assert
    await waitFor(() =>
      expect(service.listAgencies).toHaveBeenLastCalledWith({ verified: false, search: '' }, expect.objectContaining({ page: 1 })),
    )
  })
})
