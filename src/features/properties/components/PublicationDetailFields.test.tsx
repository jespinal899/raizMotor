import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PublicationDetailFields from '@/features/properties/components/PublicationDetailFields'
import type { PublicationFormValues } from '@/features/properties/types/publication.types'
import { buildPublicationValues } from '@/test/factories'

const renderFields = (overrides: Partial<PublicationFormValues>, change = vi.fn()) => {
  render(<PublicationDetailFields values={buildPublicationValues(overrides)} errors={{}} change={change} />)

  return { change }
}

const amenities = () => screen.getByRole('group', { name: 'Comodidades (opcional)' })
const amenityNames = () => within(amenities()).getAllByRole('checkbox').map((box) => box.closest('label')?.textContent)

describe('PublicationDetailFields', () => {
  it('hasta que se elige el tipo no pide medidas ni ofrece comodidades', () => {
    // Arrange
    const type = ''

    // Act
    renderFields({ type })

    // Assert
    expect(screen.getByText('Elige el tipo de propiedad para indicar sus medidas.')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Comodidades (opcional)' })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('en una casa pide los estacionamientos, sin obligar a indicarlos', () => {
    // Arrange
    const type = 'casa'

    // Act
    renderFields({ type })

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Estacionamientos (opcional)' })).toHaveValue(null)
  })

  it('en un terreno no pide estacionamientos', () => {
    // Arrange
    const type = 'terreno'

    // Act
    renderFields({ type })

    // Assert
    expect(screen.queryByRole('spinbutton', { name: /Estacionamientos/ })).not.toBeInTheDocument()
  })

  it('ofrece las comodidades del tipo elegido, sin ninguna marcada', () => {
    // Arrange
    const type = 'terreno'

    // Act
    renderFields({ type })

    // Assert
    expect(amenityNames()).toEqual(['Terreno plano', 'Agua potable', 'Energía eléctrica', 'Acceso vehicular', 'Cercado'])
    expect(within(amenities()).queryByRole('checkbox', { checked: true })).not.toBeInTheDocument()
  })

  it('muestra marcadas las comodidades ya elegidas', () => {
    // Arrange
    const features = ['Piscina', 'Terraza']

    // Act
    renderFields({ type: 'casa', features })

    // Assert
    const checked = within(amenities()).getAllByRole('checkbox', { checked: true })
    expect(checked.map((box) => box.closest('label')?.textContent)).toEqual(['Piscina', 'Terraza'])
  })

  it('al marcar una comodidad la añade a las elegidas', async () => {
    // Arrange
    const user = userEvent.setup()
    const { change } = renderFields({ type: 'casa', features: ['Piscina'] })

    // Act
    await user.click(within(amenities()).getByRole('checkbox', { name: 'Terraza' }))

    // Assert
    expect(change).toHaveBeenCalledExactlyOnceWith('features', ['Piscina', 'Terraza'])
  })

  it('al desmarcarla la quita, sin tocar las demás', async () => {
    // Arrange
    const user = userEvent.setup()
    const { change } = renderFields({ type: 'casa', features: ['Piscina', 'Terraza'] })

    // Act
    await user.click(within(amenities()).getByRole('checkbox', { name: 'Piscina' }))

    // Assert
    expect(change).toHaveBeenCalledExactlyOnceWith('features', ['Terraza'])
  })
})
