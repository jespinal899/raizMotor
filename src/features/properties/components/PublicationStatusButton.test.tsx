import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PublicationStatusButton from '@/features/properties/components/PublicationStatusButton'
import { PublicationLimitError, RateLimitedError } from '@/features/properties/services/publicationErrors'

const clickAndRead = async (reason: unknown, action: 'unpublish' | 'republish' = 'republish') => {
  const user = userEvent.setup()
  render(<PublicationStatusButton action={action} onAct={vi.fn(() => Promise.reject(reason))} />)

  await user.click(screen.getByRole('button'))

  return screen.findByRole('alert')
}

describe('PublicationStatusButton', () => {
  it('si el plan está lleno, lo explica', async () => {
    // Arrange
    const reason = new PublicationLimitError()

    // Act
    const alert = await clickAndRead(reason)

    // Assert
    expect(alert).toHaveTextContent('Tu plan está completo')
  })

  it('si se alcanzó el límite de cambios, lo dice y cuándo reintentar', async () => {
    // Arrange
    const reason = new RateLimitedError()

    // Act
    const alert = await clickAndRead(reason, 'unpublish')

    // Assert
    expect(alert).toHaveTextContent('Hiciste muchos cambios seguidos')
    expect(alert).toHaveTextContent('inténtalo de nuevo en una hora')
  })

  it('cualquier otro fallo dice que no se pudo y que sigue como estaba', async () => {
    // Arrange
    const reason = new Error('Sin conexión')

    // Act
    const alert = await clickAndRead(reason, 'unpublish')

    // Assert
    expect(alert).toHaveTextContent('No pudimos despublicarla')
    expect(alert).toHaveTextContent('Sigue en el catálogo.')
  })
})
