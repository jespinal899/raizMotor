import { render, screen } from '@testing-library/react'
import { Send } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import SubmitButton from '@/components/SubmitButton'

const renderButton = (isSubmitting: boolean) =>
  render(
    <SubmitButton isSubmitting={isSubmitting} icon={Send} submittingLabel="Enviando…">
      Enviar mensaje
    </SubmitButton>,
  )

describe('SubmitButton', () => {
  it('en reposo es un botón de envío activo con su texto', () => {
    // Arrange
    const isSubmitting = false

    // Act
    renderButton(isSubmitting)

    // Assert
    const button = screen.getByRole('button', { name: 'Enviar mensaje' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeEnabled()
  })

  it('mientras envía se desactiva, para evitar envíos duplicados, y dice lo que está haciendo', () => {
    // Arrange
    const isSubmitting = true

    // Act
    renderButton(isSubmitting)

    // Assert
    const button = screen.getByRole('button', { name: 'Enviando…' })
    expect(button).toBeDisabled()
    expect(button.querySelector('.animate-spin')).not.toBeNull()
  })
})

describe('SubmitButton desactivado', () => {
  it('se puede desactivar aunque no esté enviando, mientras otra acción del formulario está en curso', () => {
    // Arrange
    const disabled = true

    // Act
    render(
      <SubmitButton isSubmitting={false} disabled={disabled} icon={Send} submittingLabel="Enviando…">
        Enviar mensaje
      </SubmitButton>,
    )

    // Assert
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()
  })
})
