import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { anyOperationKey } from '@/test/operationKey'
import {
  FILLED_PUBLICATION,
  chooseOption,
  confirmLocationOnMap,
  currentScreen,
  fillAddress,
  fillLocationScreen,
  fillPublicationForm,
  goBack,
  goNext,
  goToScreen,
  openLocationMap,
} from '@/test/publicationForm'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))
vi.mock('@/features/properties/services/geocodingService', () => ({
  geocodingService: { locate: vi.fn(async () => undefined) },
}))

type Submit = (publication: PropertyPublication) => Promise<void>

const setup = (onSubmit: Submit = vi.fn(async () => {})) => {
  const fakeMap = buildFakeLocationMap()
  vi.mocked(createLeafletLocationMap).mockImplementation(fakeMap.createMap)
  const notify = vi.fn()
  render(<PropertyForm onSubmit={onSubmit} notify={notify} />)

  return { fakeMap, onSubmit, notify, user: userEvent.setup() }
}

const stepHeading = () => screen.getByRole('heading', { level: 2 })
const currentStep = () =>
  within(screen.getByRole('navigation', { name: 'Pasos para publicar' }))
    .getAllByRole('listitem')
    .find((item) => item.getAttribute('aria-current') === 'step')
const button = (name: string) => screen.queryByRole('button', { name })
const publishButton = () => screen.getByRole('button', { name: /Publicar propiedad|Publicando/ })
const city = () => screen.getByRole('combobox', { name: 'Ciudad' })

// Recorrer las cinco pantallas lleva muchas interacciones: se da más margen que el de una prueba normal.
describe('PropertyForm', { timeout: 20_000 }, () => {
  it('muestra los tres pasos y empieza por la propiedad', () => {
    // Arrange
    const expectedSteps = ['Propiedad', 'Publicación', 'Últimos detalles']

    // Act
    setup()

    // Assert
    const steps = within(screen.getByRole('navigation', { name: 'Pasos para publicar' })).getAllByRole('listitem')
    expect(steps.map((step, index) => step.textContent?.includes(expectedSteps[index]))).toEqual([true, true, true])
    expect(stepHeading()).toHaveTextContent('Paso 1 de 3: Propiedad')
    expect(currentStep()).toHaveTextContent('Propiedad')
  })

  it('la primera pantalla pide solo la ubicación: se avanza buscando la dirección, no con "Siguiente"', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(currentScreen()).toBe('Ubicación')
    expect(button('Buscar dirección')).toBeInTheDocument()
    expect(button('Siguiente')).not.toBeInTheDocument()
    expect(button('Atrás')).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Casa' })).not.toBeInTheDocument()
  })

  it('la ciudad no se puede elegir hasta indicar el departamento', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(city()).toBeDisabled()
    expect(city()).toHaveTextContent('Elige primero el departamento')
  })

  it('al elegir el departamento ofrece como ciudades sus municipios', async () => {
    // Arrange
    const { user } = setup()
    await chooseOption(user, 'Departamento', 'Cortés')

    // Act
    await user.click(city())

    // Assert
    const options = (await screen.findAllByRole('option')).map((option) => option.textContent)
    expect(options).toHaveLength(12)
    expect(options).toContain('San Pedro Sula')
    expect(options).not.toContain('Tegucigalpa (Distrito Central)')
  })

  it('al cambiar de departamento descarta la ciudad elegida', async () => {
    // Arrange
    const { user } = setup()
    await chooseOption(user, 'Departamento', 'Cortés')
    await chooseOption(user, 'Ciudad', 'Choloma')

    // Act
    await chooseOption(user, 'Departamento', 'Yoro')

    // Assert
    expect(city()).toHaveTextContent('Selecciona una ciudad')
  })

  it('no busca la dirección si está incompleta, y señala lo que falta', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await user.click(screen.getByRole('button', { name: 'Buscar dirección' }))

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Departamento' })).toHaveAccessibleDescription(
      'Selecciona el departamento.',
    )
    expect(screen.getByRole('textbox', { name: 'Dirección' })).toHaveAccessibleDescription('Escribe la dirección.')
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Departamento' })).toHaveFocus())
  })

  it('"Editar ubicación" cierra el mapa y vuelve a los cuatro datos de la ubicación, sin avanzar', async () => {
    // Arrange
    const { notify, user } = setup()
    await fillAddress(user)
    await openLocationMap(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar ubicación' }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Departamento' })).toHaveFocus())
    expect(currentScreen()).toBe('Ubicación')
    expect(notify).not.toHaveBeenCalled()
  })

  it('"Confirmar ubicación" avisa de que se guardó y pasa a la pantalla del tipo de propiedad', async () => {
    // Arrange
    const { fakeMap, notify, user } = setup()
    await fillAddress(user)

    // Act
    await confirmLocationOnMap(user, fakeMap)

    // Assert
    expect(notify).toHaveBeenCalledExactlyOnceWith('Ubicación guardada con éxito.')
    expect(currentScreen()).toBe('Tipo de propiedad')
    expect(stepHeading()).toHaveTextContent('Paso 1 de 3: Propiedad')
    expect(stepHeading()).toHaveFocus()
    expect(button('Atrás')).toBeInTheDocument()
    expect(button('Siguiente')).toBeInTheDocument()
  })

  it('al volver atrás, la ubicación sigue confirmada y "Siguiente" deja continuar sin repetir el mapa', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillLocationScreen(user, fakeMap)
    await goBack(user)
    const confirmed = screen.getByRole('status').textContent

    // Act
    await goNext(user)

    // Assert
    expect(confirmed).toBe('Ubicación confirmada en el mapa.')
    expect(currentScreen()).toBe('Tipo de propiedad')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('si se cambia la ubicación después de confirmarla, hay que confirmarla de nuevo para seguir', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillLocationScreen(user, fakeMap)
    await goBack(user)

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Dirección' }), ' A')

    // Assert
    expect(screen.queryByText('Ubicación confirmada en el mapa.')).not.toBeInTheDocument()
    expect(button('Siguiente')).not.toBeInTheDocument()
  })

  it('la pantalla del tipo no deja seguir sin elegirlo, y lleva el foco a sus opciones', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await goToScreen(user, fakeMap, 'Tipo de propiedad')

    // Act
    await goNext(user)

    // Assert
    expect(currentScreen()).toBe('Tipo de propiedad')
    expect(screen.getByRole('radiogroup', { name: '¿Qué tipo de propiedad es?' })).toHaveAccessibleDescription(
      'Selecciona el tipo de propiedad.',
    )
    expect(screen.getByText('Revisa los campos marcados antes de continuar.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Casa' })).toHaveFocus())
  })

  it('para un terreno solo pide su superficie', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await goToScreen(user, fakeMap, 'Tipo de propiedad')

    // Act
    await user.click(screen.getByRole('radio', { name: 'Terreno' }))

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Superficie del terreno (m²)' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Superficie construida (m²)' })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Cuartos' })).not.toBeInTheDocument()
  })

  it('el segundo paso es la publicación: título y descripción', async () => {
    // Arrange
    const { fakeMap, user } = setup()

    // Act
    await goToScreen(user, fakeMap, 'Título y descripción')

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 2 de 3: Publicación')
    expect(stepHeading()).toHaveFocus()
    expect(currentStep()).toHaveTextContent('Publicación')
    expect(screen.getByRole('textbox', { name: 'Título de la publicación' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Descripción' })).toBeInTheDocument()
  })

  it('"Atrás" vuelve a la pantalla anterior conservando lo escrito', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await goToScreen(user, fakeMap, 'Título y descripción')

    // Act
    await goBack(user)

    // Assert
    expect(currentScreen()).toBe('Tipo de propiedad')
    expect(screen.getByRole('radio', { name: 'Casa' })).toBeChecked()
    expect(screen.getByRole('spinbutton', { name: 'Cuartos' })).toHaveValue(3)
  })

  it('el tercer paso empieza por la operación y el precio, que aclara si es mensual', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await goToScreen(user, fakeMap, 'Venta o alquiler')

    // Act
    await user.click(screen.getByRole('radio', { name: 'Alquiler' }))

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 3 de 3: Últimos detalles')
    expect(screen.getByRole('spinbutton', { name: 'Precio (USD al mes)' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Agregar fotos')).not.toBeInTheDocument()
    expect(button('Siguiente')).toBeInTheDocument()
  })

  it('la última pantalla pide las fotos y ofrece publicar', async () => {
    // Arrange
    const { fakeMap, user } = setup()

    // Act
    await goToScreen(user, fakeMap, 'Fotos')

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 3 de 3: Últimos detalles')
    expect(screen.getByLabelText('Agregar fotos')).toBeInTheDocument()
    expect(publishButton()).toHaveTextContent('Publicar propiedad')
    expect(button('Siguiente')).not.toBeInTheDocument()
  })

  it('no publica sin fotos', async () => {
    // Arrange
    const { fakeMap, onSubmit, user } = setup()
    await goToScreen(user, fakeMap, 'Fotos')

    // Act
    await user.click(publishButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: /^Fotos/ })).toHaveAccessibleDescription('Agrega al menos una foto.')
  })

  it('publica la propiedad con los datos de todas las pantallas', async () => {
    // Arrange
    const { fakeMap, onSubmit, user } = setup()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(FILLED_PUBLICATION, anyOperationKey())
    expect(await screen.findByText('Tu propiedad se guardó')).toBeInTheDocument()
  })

  it('una vez publicada no deja publicarla otra vez', async () => {
    // Arrange
    const { fakeMap, onSubmit, user } = setup()
    await fillPublicationForm(user, fakeMap)
    await user.click(publishButton())
    await screen.findByText('Tu propiedad se guardó')

    // Act
    await user.click(publishButton())

    // Assert
    expect(publishButton()).toBeDisabled()
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('mientras publica desactiva el botón para evitar anuncios duplicados', async () => {
    // Arrange
    const { fakeMap, user } = setup(() => new Promise<void>(() => {}))
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(publishButton()).toBeDisabled()
    expect(publishButton()).toHaveTextContent('Publicando…')
  })

  it('si no se puede guardar, avisa del fallo y permite volver a intentar', async () => {
    // Arrange
    const { fakeMap, user } = setup(() => Promise.reject(new Error('almacenamiento no disponible')))
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar tu propiedad')
    expect(screen.queryByText('Tu propiedad se guardó')).not.toBeInTheDocument()
    expect(publishButton()).toBeEnabled()
  })
})
