import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { PublicationUnavailableError } from '@/features/properties/services/publicationService'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import {
  FILLED_PUBLICATION,
  chooseOption,
  confirmAddressOnMap,
  fillAddress,
  fillListingStep,
  fillPropertyStep,
  fillPublicationForm,
  goToNextStep,
} from '@/test/publicationForm'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))
vi.mock('@/features/properties/services/geocodingService', () => ({
  geocodingService: { locate: vi.fn(async () => undefined) },
}))

type Submit = (publication: PropertyPublication) => Promise<void>

const setup = (onSubmit: Submit = vi.fn(async () => {})) => {
  const fakeMap = buildFakeLocationMap()
  vi.mocked(createLeafletLocationMap).mockImplementation(fakeMap.createMap)
  render(<PropertyForm onSubmit={onSubmit} />)

  return { fakeMap, onSubmit, user: userEvent.setup() }
}

const stepHeading = () => screen.getByRole('heading', { level: 2 })
const currentStep = () =>
  within(screen.getByRole('navigation', { name: 'Pasos para publicar' }))
    .getAllByRole('listitem')
    .find((item) => item.getAttribute('aria-current') === 'step')
const publishButton = () => screen.getByRole('button', { name: /Publicar propiedad|Publicando/ })
const city = () => screen.getByRole('combobox', { name: 'Ciudad' })

// Recorrer los tres pasos lleva muchas interacciones: se da más margen que el de una prueba normal.
describe('PropertyForm', { timeout: 20_000 }, () => {
  it('reparte la publicación en tres pasos y empieza por la propiedad', () => {
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

  it('el primer paso pide la ubicación y el tipo de propiedad, y aún no ofrece publicar', () => {
    // Arrange
    const expectedSections = ['Ubicación', 'Tipo de propiedad']

    // Act
    setup()

    // Assert
    const sections = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(sections).toEqual(expectedSections)
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Publicar propiedad' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument()
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
  })

  it('al confirmar la dirección en el mapa lo indica y sigue con el tipo de propiedad', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillAddress(user)

    // Act
    await confirmAddressOnMap(user, fakeMap)

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Dirección confirmada en el mapa.')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Casa' })).toHaveFocus())
  })

  it('si se cambia la dirección después de confirmarla, pide confirmarla de nuevo', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillAddress(user)
    await confirmAddressOnMap(user, fakeMap)

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Dirección' }), ' A')

    // Assert
    expect(screen.queryByText('Dirección confirmada en el mapa.')).not.toBeInTheDocument()
  })

  it('para un terreno solo pide su superficie', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await user.click(screen.getByRole('radio', { name: 'Terreno' }))

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Superficie del terreno (m²)' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Superficie construida (m²)' })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Cuartos' })).not.toBeInTheDocument()
  })

  it('no deja pasar al segundo paso con el primero incompleto, y lleva el foco al primer dato que falta', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await goToNextStep(user)

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 1 de 3: Propiedad')
    expect(screen.getByRole('group', { name: 'Ubicación en el mapa' })).toHaveAccessibleDescription(
      'Busca la dirección y confírmala en el mapa.',
    )
    expect(screen.getByText('Revisa los campos marcados antes de continuar.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Departamento' })).toHaveFocus())
  })

  it('con el primer paso completo, "Siguiente" lleva a la publicación: título y descripción', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillPropertyStep(user, fakeMap)

    // Act
    await goToNextStep(user)

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 2 de 3: Publicación')
    expect(stepHeading()).toHaveFocus()
    expect(currentStep()).toHaveTextContent('Publicación')
    expect(screen.getByRole('textbox', { name: 'Título de la publicación' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Descripción' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Departamento' })).not.toBeInTheDocument()
  })

  it('"Atrás" vuelve al paso anterior conservando lo escrito', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillPropertyStep(user, fakeMap)
    await goToNextStep(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Atrás' }))

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 1 de 3: Propiedad')
    expect(city()).toHaveTextContent('San Pedro Sula')
    expect(screen.getByRole('textbox', { name: 'Dirección' })).toHaveValue('10 calle, casa 25')
    expect(screen.getByRole('status')).toHaveTextContent('Dirección confirmada en el mapa.')
  })

  it('el último paso pide la operación, el precio y las fotos, y ofrece publicar', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillPropertyStep(user, fakeMap)
    await goToNextStep(user)
    await fillListingStep(user)

    // Act
    await goToNextStep(user)

    // Assert
    expect(stepHeading()).toHaveTextContent('Paso 3 de 3: Últimos detalles')
    expect(screen.getByRole('radiogroup', { name: 'Tipo de operación' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Precio (USD)' })).toBeInTheDocument()
    expect(screen.getByLabelText('Agregar fotos')).toBeInTheDocument()
    expect(publishButton()).toHaveTextContent('Publicar propiedad')
  })

  it('aclara que el precio es mensual cuando la operación es alquiler', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await fillPropertyStep(user, fakeMap)
    await goToNextStep(user)
    await fillListingStep(user)
    await goToNextStep(user)

    // Act
    await user.click(screen.getByRole('radio', { name: 'Alquiler' }))

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Precio (USD al mes)' })).toBeInTheDocument()
  })

  it('no publica si falta algo en el último paso', async () => {
    // Arrange
    const { fakeMap, onSubmit, user } = setup()
    await fillPropertyStep(user, fakeMap)
    await goToNextStep(user)
    await fillListingStep(user)
    await goToNextStep(user)

    // Act
    await user.click(publishButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('spinbutton', { name: 'Precio (USD)' })).toHaveAccessibleDescription('Indica el precio.')
    expect(screen.getByRole('group', { name: /^Fotos/ })).toHaveAccessibleDescription('Agrega al menos una foto.')
  })

  it('publica la propiedad con los datos de los tres pasos', async () => {
    // Arrange
    const { fakeMap, onSubmit, user } = setup()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(FILLED_PUBLICATION)
    expect(await screen.findByText('Tu propiedad se publicó')).toBeInTheDocument()
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

  it('si la publicación aún no está activa lo avisa, sin dar el anuncio por publicado', async () => {
    // Arrange
    const { fakeMap, user } = setup(() => Promise.reject(new PublicationUnavailableError()))
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('La publicación aún no está disponible')
    expect(screen.queryByText('Tu propiedad se publicó')).not.toBeInTheDocument()
    expect(publishButton()).toBeEnabled()
  })
})
