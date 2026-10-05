import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import BusyButton from '@/components/BusyButton'

const renderButton = (isBusy: boolean, onClick = vi.fn()) => {
  render(
    <BusyButton isBusy={isBusy} icon={Search} busyLabel="Buscando…" onClick={onClick}>
      Buscar dirección
    </BusyButton>,
  )

  return { onClick }
}

describe('BusyButton', () => {
  it('en reposo es un botón normal, que no envía formularios, y responde al pulsarlo', async () => {
    // Arrange
    const { onClick } = renderButton(false)
    const button = screen.getByRole('button', { name: 'Buscar dirección' })

    // Act
    await userEvent.setup().click(button)

    // Assert
    expect(button).toHaveAttribute('type', 'button')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('mientras trabaja se desactiva, muestra el indicador de carga y dice lo que está haciendo', () => {
    // Arrange
    const isBusy = true

    // Act
    renderButton(isBusy)

    // Assert
    const button = screen.getByRole('button', { name: 'Buscando…' })
    expect(button).toBeDisabled()
    expect(button.querySelector('.animate-spin')).not.toBeNull()
  })
})

describe('BusyButton desactivado', () => {
  it('se puede desactivar aunque no esté trabajando, por ejemplo mientras otra acción está en curso', () => {
    // Arrange
    const disabled = true

    // Act
    render(
      <BusyButton isBusy={false} disabled={disabled} icon={Search} busyLabel="Buscando…">
        Buscar dirección
      </BusyButton>,
    )

    // Assert
    expect(screen.getByRole('button', { name: 'Buscar dirección' })).toBeDisabled()
  })
})
