import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddressMapDialog from '@/features/properties/components/AddressMapDialog'
import type { AddressReview } from '@/features/properties/hooks/useAddressSearch'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'

const ADDRESS = 'Avenida República de Chile, casa 12, Colonia Palmira, Tegucigalpa (Distrito Central), Francisco Morazán'
const FOUND_POINT = { lat: 14.1021, lng: -87.1897 }
const REVIEW: AddressReview = { precision: 'neighborhood', view: { center: FOUND_POINT, zoom: 16 } }

interface Overrides {
  open?: boolean
  review?: AddressReview
}

const setup = ({ open = true, review = REVIEW }: Overrides = {}) => {
  const fake = buildFakeLocationMap()
  const onConfirm = vi.fn()
  const onEdit = vi.fn()
  render(
    <AddressMapDialog
      open={open}
      address={ADDRESS}
      review={review}
      onConfirm={onConfirm}
      onEdit={onEdit}
      createMap={fake.createMap}
    />,
  )

  return { fake, onConfirm, onEdit, user: userEvent.setup() }
}

describe('AddressMapDialog', () => {
  it('pregunta si la dirección es correcta y la muestra para reconocerla', async () => {
    // Arrange: dirección encontrada

    // Act
    setup()

    // Assert
    const dialog = await screen.findByRole('dialog', { name: '¿La dirección es correcta?' })
    expect(dialog).toHaveTextContent(ADDRESS)
  })

  it('muestra en el mapa el punto encontrado', async () => {
    // Arrange: dirección encontrada

    // Act
    const { fake } = setup()

    // Assert
    await screen.findByRole('dialog')
    expect(fake.map.showPoint).toHaveBeenCalledExactlyOnceWith(REVIEW.view)
  })

  it.each([
    { precision: 'neighborhood', expected: 'Encontramos la zona.' },
    { precision: 'city', expected: 'No encontramos la colonia, así que el mapa muestra la ciudad.' },
    { precision: 'department', expected: 'No pudimos encontrar la dirección' },
  ] as const)('explica hasta dónde llegó la búsqueda ($precision) y cómo corregir el punto', async ({ precision, expected }) => {
    // Arrange
    const review = { ...REVIEW, precision }

    // Act
    setup({ review })

    // Assert
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(expected)
    expect(dialog).toHaveTextContent(/arrastra el marcador/i)
  })

  it('al confirmar sin mover el marcador devuelve el punto encontrado', async () => {
    // Arrange
    const { onConfirm, user } = setup()

    // Act
    await user.click(await screen.findByRole('button', { name: 'Confirmar ubicación' }))

    // Assert
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(FOUND_POINT)
  })

  it('al confirmar después de mover el marcador devuelve el punto corregido', async () => {
    // Arrange
    const corrected = { lat: 14.1035, lng: -87.1902 }
    const { fake, onConfirm, user } = setup()
    await screen.findByRole('dialog')
    act(() => fake.moveMarkerTo(corrected))

    // Act
    await user.click(screen.getByRole('button', { name: 'Confirmar ubicación' }))

    // Assert
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(corrected)
  })

  it('"Editar ubicación" vuelve al formulario sin confirmar ningún punto', async () => {
    // Arrange
    const { onConfirm, onEdit, user } = setup()

    // Act
    await user.click(await screen.findByRole('button', { name: 'Editar ubicación' }))

    // Assert
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('cerrarla con la tecla Escape equivale a editar la ubicación', async () => {
    // Arrange
    const { onConfirm, onEdit, user } = setup()
    await screen.findByRole('dialog')

    // Act
    await user.keyboard('{Escape}')

    // Assert
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('avisa cuando ha terminado de cerrarse', async () => {
    // Arrange
    const onClosed = vi.fn()
    const props = { address: ADDRESS, review: REVIEW, onConfirm: vi.fn(), onEdit: vi.fn(), onClosed }
    const { rerender } = render(<AddressMapDialog open {...props} createMap={buildFakeLocationMap().createMap} />)
    await screen.findByRole('dialog')

    // Act
    rerender(<AddressMapDialog open={false} {...props} createMap={buildFakeLocationMap().createMap} />)

    // Assert
    await waitFor(() => expect(onClosed).toHaveBeenCalledOnce())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('mientras está cerrada no muestra nada', () => {
    // Arrange
    const open = false

    // Act
    setup({ open })

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
