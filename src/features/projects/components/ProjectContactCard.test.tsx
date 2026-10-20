import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProjectContactCard from '@/features/projects/components/ProjectContactCard'
import { PROJECTS } from '@/features/projects/data/projects.data'
import type { ProjectQuoteService } from '@/features/projects/services/projectQuoteService'
import { renderWithRouter } from '@/test/renderWithRouter'

const PROJECT = { ...PROJECTS[0], id: '0b9f8c1e-6f3a-4c8e-9a51-2f1c3d4e5f60', example: false }

const fillApplicant = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: 'Nombre y apellido' }), 'Ana Mejía')
  await user.type(screen.getByRole('textbox', { name: /Correo/ }), 'ana@gmail.com')
  await user.type(screen.getByRole('textbox', { name: /Teléfono/ }), '99998888')
  await user.click(screen.getByRole('checkbox'))
}

describe('ProjectContactCard', () => {
  it('pide la cotización con el modelo elegido y avisa que la recibió la desarrolladora', async () => {
    // Arrange
    const user = userEvent.setup()
    const quoteService: ProjectQuoteService = { request: vi.fn(async () => {}) }
    renderWithRouter(<ProjectContactCard project={PROJECT} quoteService={quoteService} />)

    // Act
    await user.click(screen.getByRole('combobox', { name: /Modelo que te interesa/ }))
    await user.click(await screen.findByRole('option', { name: /^Modelo A/ }))
    await fillApplicant(user)
    await user.click(screen.getByRole('button', { name: 'Pedir cotización' }))

    // Assert
    await waitFor(() =>
      expect(quoteService.request).toHaveBeenCalledExactlyOnceWith(
        { projectId: PROJECT.id, model: 'Modelo A', fullName: 'Ana Mejía', email: 'ana@gmail.com', phone: '+50499998888' },
        expect.any(String),
      ),
    )
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('sin elegir un modelo, la cotización va por el proyecto en general', async () => {
    // Arrange
    const user = userEvent.setup()
    const quoteService: ProjectQuoteService = { request: vi.fn(async () => {}) }
    renderWithRouter(<ProjectContactCard project={PROJECT} quoteService={quoteService} />)

    // Act
    await fillApplicant(user)
    await user.click(screen.getByRole('button', { name: 'Pedir cotización' }))

    // Assert
    await waitFor(() => expect(quoteService.request).toHaveBeenCalled())
    expect(vi.mocked(quoteService.request).mock.calls[0][0]).not.toHaveProperty('model')
  })
})
