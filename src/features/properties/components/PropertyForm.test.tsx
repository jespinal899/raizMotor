import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import { PublicationUnavailableError } from '@/features/properties/services/publicationService'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { getDepartmentView } from '@/features/properties/utils/departments'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'
import { FILLED_PUBLICATION, fillPublicationForm } from '@/test/publicationForm'

vi.mock('@/features/properties/services/locationMap', () => ({ createLeafletLocationMap: vi.fn() }))

type Submit = (publication: PropertyPublication) => Promise<void>

const setup = (onSubmit: Submit = vi.fn(async () => {})) => {
  const fakeMap = buildFakeLocationMap()
  vi.mocked(createLeafletLocationMap).mockImplementation(fakeMap.createMap)
  render(<PropertyForm onSubmit={onSubmit} />)

  return { fakeMap, onSubmit, user: userEvent.setup() }
}

const publishButton = () => screen.getByRole('button', { name: /Publicar propiedad|Publicando/ })
const department = () => screen.getByRole('combobox', { name: 'Departamento' })
const chooseType = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('radio', { name }))

describe('PropertyForm', () => {
  it('organiza los datos en ubicación, características, anuncio y fotos', () => {
    // Arrange
    const expectedSections = ['Ubicación', 'Características', 'Anuncio', 'Fotos']

    // Act
    setup()

    // Assert
    const sections = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(sections).toEqual(expectedSections)
  })

  it('no pide medidas hasta que se elige el tipo de propiedad', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(screen.queryByRole('spinbutton', { name: 'Cuartos' })).not.toBeInTheDocument()
    expect(screen.getByText('Elige el tipo de propiedad para indicar sus medidas.')).toBeInTheDocument()
  })

  it('para una casa pide superficies, cuartos y baños', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await chooseType(user, 'Casa')

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Superficie construida (m²)' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Superficie del terreno (m²)' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Cuartos' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Baños' })).toBeInTheDocument()
  })

  it('para un terreno solo pide su superficie', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await chooseType(user, 'Terreno')

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Superficie del terreno (m²)' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Superficie construida (m²)' })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Cuartos' })).not.toBeInTheDocument()
  })

  it('al elegir el departamento acerca el mapa a su cabecera', async () => {
    // Arrange
    const { fakeMap, user } = setup()
    await user.click(department())

    // Act
    await user.click(await screen.findByRole('option', { name: 'Cortés' }))

    // Assert
    expect(fakeMap.map.setView).toHaveBeenLastCalledWith(getDepartmentView('cortes'))
  })

  it('al mover el mapa muestra el punto marcado', () => {
    // Arrange
    const { fakeMap } = setup()

    // Act
    act(() => fakeMap.moveTo({ lat: 15.5, lng: -88.03 }))

    // Assert
    expect(screen.getByText('Punto marcado: 15.50000, -88.03000')).toBeInTheDocument()
  })

  it('aclara que el precio es mensual cuando la operación es alquiler', async () => {
    // Arrange
    const { user } = setup()

    // Act
    await user.click(screen.getByRole('radio', { name: 'Alquiler' }))

    // Assert
    expect(screen.getByRole('spinbutton', { name: 'Precio (USD al mes)' })).toBeInTheDocument()
  })

  it('publica la propiedad con todos los datos escritos', async () => {
    // Arrange
    const { fakeMap, onSubmit, user } = setup()
    await fillPublicationForm(user, fakeMap)

    // Act
    await user.click(publishButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(FILLED_PUBLICATION)
    expect(await screen.findByRole('status')).toHaveTextContent('Tu propiedad se publicó')
  })

  it('no publica un formulario vacío: señala los campos y lleva el foco al primero', async () => {
    // Arrange
    const { onSubmit, user } = setup()

    // Act
    await user.click(publishButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(department()).toHaveAccessibleDescription('Selecciona el departamento.')
    expect(screen.getByRole('textbox', { name: 'Ciudad' })).toHaveAccessibleDescription('Escribe la ciudad.')
    expect(screen.getByText('Revisa los campos marcados antes de publicar.')).toBeInTheDocument()
    await waitFor(() => expect(department()).toHaveFocus())
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
