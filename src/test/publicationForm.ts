import { act, screen, waitFor } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { expect } from 'vitest'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { buildImageFile } from '@/test/factories'
import type { buildFakeLocationMap } from '@/test/fakeLocationMap'

type FakeLocationMap = ReturnType<typeof buildFakeLocationMap>

const PHOTO = buildImageFile({ name: 'fachada.jpg' })

/** Publicación que debe salir del formulario después de `fillPublicationForm`. */
export const FILLED_PUBLICATION: PropertyPublication = {
  location: {
    department: 'cortes',
    city: 'San Pedro Sula',
    neighborhood: 'Colonia Trejo',
    address: '10 calle, casa 25',
    coordinates: { lat: 15.5, lng: -88.03 },
  },
  type: 'casa',
  builtArea: 180,
  landArea: 250,
  bedrooms: 3,
  bathrooms: 2,
  title: 'Casa amplia con patio',
  description: 'Casa de una planta con patio amplio y cochera.',
  operation: 'venta',
  price: 145000,
  images: [PHOTO],
}

const { location, ...listing } = FILLED_PUBLICATION

/** Pega el texto de una vez: escribirlo tecla a tecla en un formulario tan largo haría lentas las pruebas. */
const typeIn = async (user: UserEvent, role: 'textbox' | 'spinbutton', name: string, text: string | number) => {
  await user.click(screen.getByRole(role, { name }))
  await user.paste(String(text))
}

export const chooseOption = async (user: UserEvent, field: string, option: string) => {
  await user.click(screen.getByRole('combobox', { name: field }))
  await user.click(await screen.findByRole('option', { name: option }))
}

/** Escribe la dirección de la propiedad, sin confirmarla todavía en el mapa. */
export const fillAddress = async (user: UserEvent) => {
  await chooseOption(user, 'Departamento', 'Cortés')
  await chooseOption(user, 'Ciudad', location.city)
  await typeIn(user, 'textbox', 'Colonia, barrio o residencial', location.neighborhood)
  await typeIn(user, 'textbox', 'Dirección', location.address)
}

/** Busca la dirección, corrige el marcador en la ventana del mapa y la confirma. */
export const confirmAddressOnMap = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  await user.click(screen.getByRole('button', { name: 'Buscar dirección' }))
  await screen.findByRole('dialog', { name: '¿La dirección es correcta?' })
  act(() => fakeMap.moveMarkerTo(location.coordinates))
  await user.click(screen.getByRole('button', { name: 'Confirmar dirección' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}

/** Paso 1: una casa en San Pedro Sula, con la dirección confirmada en el mapa. */
export const fillPropertyStep = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  await fillAddress(user)
  await confirmAddressOnMap(user, fakeMap)
  await user.click(screen.getByRole('radio', { name: 'Casa' }))
  await typeIn(user, 'spinbutton', 'Superficie construida (m²)', listing.builtArea ?? '')
  await typeIn(user, 'spinbutton', 'Superficie del terreno (m²)', listing.landArea ?? '')
  await typeIn(user, 'spinbutton', 'Cuartos', listing.bedrooms ?? '')
  await typeIn(user, 'spinbutton', 'Baños', listing.bathrooms ?? '')
}

/** Paso 2: título y descripción del anuncio. */
export const fillListingStep = async (user: UserEvent) => {
  await typeIn(user, 'textbox', 'Título de la publicación', listing.title)
  await typeIn(user, 'textbox', 'Descripción', listing.description)
}

/** Paso 3: operación, precio y una foto. */
export const fillDetailsStep = async (user: UserEvent) => {
  await user.click(screen.getByRole('radio', { name: 'Venta' }))
  await typeIn(user, 'spinbutton', 'Precio (USD)', listing.price)
  await user.upload(screen.getByLabelText('Agregar fotos'), PHOTO)
}

export const goToNextStep = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Siguiente' }))

/** Recorre los tres pasos rellenándolos como lo haría una persona; queda en el último, listo para publicar. */
export const fillPublicationForm = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  await fillPropertyStep(user, fakeMap)
  await goToNextStep(user)
  await fillListingStep(user)
  await goToNextStep(user)
  await fillDetailsStep(user)
}
