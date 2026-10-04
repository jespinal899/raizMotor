import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddressConfirmation from '@/features/properties/components/AddressConfirmation'
import type { GeocodingService } from '@/features/properties/services/geocodingService'
import { getDepartmentView } from '@/features/properties/utils/departments'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'

type Locate = GeocodingService['locate']

const LOCATION = {
  department: 'francisco-morazan',
  city: 'Tegucigalpa (Distrito Central)',
  neighborhood: 'Colonia Palmira',
  address: 'Avenida República de Chile, casa 12',
}
const FOUND_POINT = { lat: 14.1021, lng: -87.1897 }

interface Overrides {
  isConfirmed?: boolean
  error?: string
  canSearch?: () => boolean
  locate?: Locate
}

const setup = ({
  isConfirmed = false,
  error,
  canSearch = () => true,
  locate = vi.fn<Locate>(async () => ({ point: FOUND_POINT, precision: 'neighborhood' })),
}: Overrides = {}) => {
  const fake = buildFakeLocationMap()
  const onConfirm = vi.fn()
  const onConfirmed = vi.fn()
  render(
    <>
      <input aria-label="Departamento" />
      <AddressConfirmation
        location={LOCATION}
        isConfirmed={isConfirmed}
        error={error}
        canSearch={canSearch}
        onConfirm={onConfirm}
        onConfirmed={onConfirmed}
        // Con la ventana abierta el resto de la página queda oculto a los lectores: por eso `hidden`.
        focusAfterEdit={() => screen.queryByRole('textbox', { name: 'Departamento', hidden: true })}
        locate={locate}
        createMap={fake.createMap}
      />
    </>,
  )

  return { fake, onConfirm, onConfirmed, locate, user: userEvent.setup() }
}

const searchButton = () => screen.getByRole('button', { name: /Buscar dirección|Buscando/ })
const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(searchButton())
  return screen.findByRole('dialog', { name: '¿La dirección es correcta?' })
}
const dialogClosed = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

describe('AddressConfirmation', () => {
  it('ofrece buscar la dirección y, mientras no se confirme, no da la ubicación por confirmada', () => {
    // Arrange: dirección escrita y aún sin confirmar

    // Act
    setup()

    // Assert
    expect(searchButton()).toHaveTextContent('Buscar dirección')
    expect(screen.queryByText('Ubicación confirmada en el mapa.')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no busca si a la dirección le faltan datos', async () => {
    // Arrange
    const { locate, user } = setup({ canSearch: () => false })

    // Act
    await user.click(searchButton())

    // Assert
    expect(locate).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('al buscar abre la ventana con el mapa en el punto encontrado y sus dos opciones', async () => {
    // Arrange
    const { fake, user } = setup()

    // Act
    const dialog = await openDialog(user)

    // Assert
    expect(dialog).toHaveTextContent('Avenida República de Chile, casa 12, Colonia Palmira')
    expect(fake.map.showPoint).toHaveBeenCalledExactlyOnceWith({ center: FOUND_POINT, zoom: 16 })
    expect(screen.getByRole('button', { name: 'Editar ubicación' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar ubicación' })).toBeInTheDocument()
  })

  it('si el buscador no la encuentra, abre el mapa en la cabecera del departamento', async () => {
    // Arrange
    const { fake, user } = setup({ locate: async () => undefined })

    // Act
    await openDialog(user)

    // Assert
    expect(fake.map.showPoint).toHaveBeenCalledExactlyOnceWith(getDepartmentView('francisco-morazan'))
  })

  it('mientras busca lo indica y no deja repetir la búsqueda', async () => {
    // Arrange
    const { user } = setup({ locate: () => new Promise(() => {}) })

    // Act
    await user.click(searchButton())

    // Assert
    expect(searchButton()).toBeDisabled()
    expect(searchButton()).toHaveTextContent('Buscando…')
  })

  it('al confirmar guarda el punto del marcador y, con la ventana ya cerrada, avisa para seguir adelante', async () => {
    // Arrange
    const corrected = { lat: 14.1035, lng: -87.1902 }
    const { fake, onConfirm, onConfirmed, user } = setup()
    await openDialog(user)
    act(() => fake.moveMarkerTo(corrected))

    // Act
    await user.click(screen.getByRole('button', { name: 'Confirmar ubicación' }))

    // Assert
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(corrected)
    await dialogClosed()
    await waitFor(() => expect(onConfirmed).toHaveBeenCalledOnce())
  })

  it('"Editar ubicación" cierra la ventana sin confirmar y devuelve el foco a los campos de la ubicación', async () => {
    // Arrange
    const { onConfirm, onConfirmed, user } = setup()
    await openDialog(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar ubicación' }))

    // Assert
    await dialogClosed()
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Departamento' })).toHaveFocus())
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onConfirmed).not.toHaveBeenCalled()
  })

  it('con la ubicación confirmada lo indica', () => {
    // Arrange
    const isConfirmed = true

    // Act
    setup({ isConfirmed })

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Ubicación confirmada en el mapa.')
  })

  it('con error, lo muestra enlazado con el bloque del mapa', () => {
    // Arrange
    const error = 'Busca la dirección y confírmala en el mapa.'

    // Act
    setup({ error })

    // Assert
    const group = screen.getByRole('group', { name: 'Ubicación en el mapa' })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription(error)
  })
})
