import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PasswordInput from '@/components/PasswordInput'

const CAPS_LOCK_WARNING = 'Bloq Mayús está activado.'

const renderInput = () => render(<PasswordInput aria-label="Contraseña" />)

const field = () => screen.getByLabelText('Contraseña')
const toggle = () => screen.getByRole('button', { name: /(Mostrar|Ocultar) contraseña/ })

describe('PasswordInput', () => {
  it('oculta lo escrito por defecto y ofrece mostrarlo', () => {
    // Arrange: campo recién mostrado

    // Act
    renderInput()

    // Assert
    expect(field()).toHaveAttribute('type', 'password')
    expect(toggle()).toHaveAccessibleName('Mostrar contraseña')
  })

  it('al pulsar el botón muestra la contraseña y ofrece ocultarla', async () => {
    // Arrange
    const user = userEvent.setup()
    renderInput()
    await user.type(field(), 'secreta123')

    // Act
    await user.click(toggle())

    // Assert
    expect(field()).toHaveAttribute('type', 'text')
    expect(field()).toHaveValue('secreta123')
    expect(toggle()).toHaveAccessibleName('Ocultar contraseña')
  })

  it('al pulsarlo de nuevo vuelve a ocultarla', async () => {
    // Arrange
    const user = userEvent.setup()
    renderInput()
    await user.click(toggle())

    // Act
    await user.click(toggle())

    // Assert
    expect(field()).toHaveAttribute('type', 'password')
  })

  it('el botón de mostrar no envía el formulario que lo contiene', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput aria-label="Contraseña" />
      </form>,
    )

    // Act
    await user.click(toggle())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('se comporta como un campo normal: recibe sus propiedades y avisa de cada cambio', async () => {
    // Arrange
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PasswordInput aria-label="Contraseña" name="password" autoComplete="current-password" onChange={onChange} />)

    // Act
    await user.type(field(), 'abc')

    // Assert
    expect(field()).toHaveAttribute('name', 'password')
    expect(field()).toHaveAttribute('autocomplete', 'current-password')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('no avisa de Bloq Mayús mientras está desactivado', async () => {
    // Arrange
    const user = userEvent.setup()
    renderInput()

    // Act
    await user.type(field(), 'abc')

    // Assert
    expect(screen.queryByText(CAPS_LOCK_WARNING)).not.toBeInTheDocument()
  })

  it('avisa cuando se escribe con Bloq Mayús activado', async () => {
    // Arrange
    const user = userEvent.setup()
    renderInput()
    await user.click(field())

    // Act
    await user.keyboard('{CapsLock}')

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(CAPS_LOCK_WARNING)
  })

  it('retira el aviso cuando se sigue escribiendo con Bloq Mayús desactivado', async () => {
    // Arrange
    const user = userEvent.setup()
    renderInput()
    await user.click(field())
    await user.keyboard('{CapsLock}')

    // Act
    await user.keyboard('{CapsLock}a')

    // Assert
    expect(screen.queryByText(CAPS_LOCK_WARNING)).not.toBeInTheDocument()
  })

  it('retira el aviso al salir del campo', async () => {
    // Arrange
    const user = userEvent.setup()
    renderInput()
    await user.click(field())
    await user.keyboard('{CapsLock}')

    // Act
    await user.click(document.body)

    // Assert
    expect(screen.queryByText(CAPS_LOCK_WARNING)).not.toBeInTheDocument()
  })
})
