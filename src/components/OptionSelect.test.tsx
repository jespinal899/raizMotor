import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OptionSelect from '@/components/OptionSelect'

const OPTIONS = [
  { value: 'cortes', label: 'Cortés' },
  { value: 'francisco-morazan', label: 'Francisco Morazán' },
]

/** Simula una pantalla que se maneja con el dedo (teléfono) o con un ratón (computadora). */
const screenIs = (touch: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: touch && query === '(pointer: coarse)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )

const renderSelect = (value = '', onChange = vi.fn()) => {
  render(
    <>
      <span id="etiqueta">Departamento</span>
      <OptionSelect
        options={OPTIONS}
        value={value}
        onChange={onChange}
        placeholder="Elige el departamento"
        triggerProps={{ 'aria-labelledby': 'etiqueta' }}
      />
    </>,
  )

  return { onChange }
}

describe('OptionSelect', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('en un teléfono usa la lista del sistema, con el texto de ayuda mientras no se elige nada', () => {
    // Arrange
    screenIs(true)

    // Act
    renderSelect()

    // Assert
    const select = screen.getByRole('combobox', { name: 'Departamento' })
    expect(select.tagName).toBe('SELECT')
    expect(select).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Elige el departamento' })).toBeDisabled()
    expect(select).toHaveClass('text-base')
  })

  it('en un teléfono avisa la opción elegida', async () => {
    // Arrange
    screenIs(true)
    const { onChange } = renderSelect()

    // Act
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Departamento' }), 'Cortés')

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith('cortes')
  })

  it('en un teléfono, con algo elegido, ya no ofrece el texto de ayuda', () => {
    // Arrange
    screenIs(true)

    // Act
    renderSelect('francisco-morazan')

    // Assert
    expect(screen.getByRole('combobox', { name: 'Departamento' })).toHaveValue('francisco-morazan')
    expect(screen.queryByRole('option', { name: 'Elige el departamento' })).not.toBeInTheDocument()
  })

  it('con ratón usa el menú del sitio', () => {
    // Arrange
    screenIs(false)

    // Act
    renderSelect()

    // Assert
    expect(screen.getByRole('combobox', { name: 'Departamento' }).tagName).not.toBe('SELECT')
    expect(screen.getByText('Elige el departamento')).toBeInTheDocument()
  })
})
