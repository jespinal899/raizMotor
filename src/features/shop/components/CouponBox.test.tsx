import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CouponBox from '@/features/shop/components/CouponBox'

const toggle = () => screen.getByRole('checkbox', { name: '¿Tienes un código de descuento?' })
const field = () => screen.getByRole('textbox', { name: 'Código de descuento' })
const applyButton = () => screen.getByRole('button', { name: 'Aplicar' })

/** Lo pinta dentro de un formulario, como va en la página, para comprobar que no lo envía. */
const setup = () => {
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
  const { container } = render(
    <form>
      <CouponBox />
    </form>,
  )
  container.querySelector('form')?.addEventListener('submit', onSubmit)

  return { user: userEvent.setup(), onSubmit }
}

/** Marca la casilla, que es lo que muestra el campo del código. */
const setupWithField = async () => {
  const context = setup()
  await context.user.click(toggle())

  return context
}

describe('CouponBox', () => {
  it('pregunta si se tiene un código de descuento, con la casilla sin marcar y sin campo a la vista', () => {
    // Arrange: resumen recién abierto

    // Act
    setup()

    // Assert
    expect(toggle()).not.toBeChecked()
    expect(screen.queryByRole('textbox', { name: 'Código de descuento' })).not.toBeInTheDocument()
  })

  it('al marcar la casilla aparece el campo para escribir el código y el botón para aplicarlo', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await user.click(toggle())

    // Assert
    expect(field()).toHaveValue('')
    expect(applyButton()).toBeInTheDocument()
  })

  it('al desmarcarla se retira el campo y se olvida lo escrito', async () => {
    // Arrange
    const { user } = await setupWithField()
    await user.type(field(), 'PROMO10')
    await user.click(toggle())

    // Act
    await user.click(toggle())

    // Assert
    expect(field()).toHaveValue('')
  })

  it('sin código, pide escribirlo', async () => {
    // Arrange
    const { user } = await setupWithField()

    // Act
    await user.click(applyButton())

    // Assert
    expect(field()).toHaveAccessibleDescription('Escribe el código de descuento.')
  })

  it('todavía no hay códigos: cualquiera responde que no es válido', async () => {
    // Arrange
    const { user } = await setupWithField()
    await user.type(field(), 'PROMO10')

    // Act
    await user.click(applyButton())

    // Assert
    expect(field()).toHaveAccessibleDescription('Ese código de descuento no es válido.')
    expect(field()).toHaveAttribute('aria-invalid', 'true')
  })

  it('al cambiar el código retira el aviso', async () => {
    // Arrange
    const { user } = await setupWithField()
    await user.type(field(), 'PROMO10')
    await user.click(applyButton())

    // Act
    await user.type(field(), '0')

    // Assert
    expect(field()).not.toHaveAccessibleDescription()
  })

  it('aplicar el código no envía el formulario en el que está, tampoco con la tecla Intro', async () => {
    // Arrange
    const { user, onSubmit } = await setupWithField()
    await user.type(field(), 'PROMO10')

    // Act
    await user.keyboard('{Enter}')

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(field()).toHaveAccessibleDescription('Ese código de descuento no es válido.')
  })
})
