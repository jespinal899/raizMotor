import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StepBackButton from '@/components/StepBackButton'

describe('StepBackButton', () => {
  it('al pulsarlo avisa para volver al paso anterior', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StepBackButton onClick={onClick} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Atrás' }))

    // Assert
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('no envía el formulario en el que está', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    const { container } = render(
      <form>
        <StepBackButton onClick={vi.fn()} />
      </form>,
    )
    container.querySelector('form')?.addEventListener('submit', onSubmit)

    // Act
    await user.click(screen.getByRole('button', { name: 'Atrás' }))

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
