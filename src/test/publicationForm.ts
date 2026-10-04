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

/** Título de la pantalla que se está mostrando (cada pantalla tiene una sola sección). */
export const currentScreen = () => screen.getByRole('heading', { level: 3 }).textContent

const screenShown = (title: string) => waitFor(() => expect(currentScreen()).toBe(title))

/** Escribe los cuatro datos de la ubicación, sin confirmarla todavía en el mapa. */
export const fillAddress = async (user: UserEvent) => {
  await chooseOption(user, 'Departamento', 'Cortés')
  await chooseOption(user, 'Ciudad', location.city)
  await typeIn(user, 'textbox', 'Colonia, barrio o residencial', location.neighborhood)
  await typeIn(user, 'textbox', 'Dirección', location.address)
}

/** Busca la dirección y abre la ventana del mapa. */
export const openLocationMap = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: 'Buscar dirección' }))
  await screen.findByRole('dialog', { name: '¿La dirección es correcta?' })
}

/** Corrige el marcador en la ventana del mapa y confirma: el formulario pasa solo al tipo de propiedad. */
export const confirmLocationOnMap = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  await openLocationMap(user)
  act(() => fakeMap.moveMarkerTo(location.coordinates))
  await user.click(screen.getByRole('button', { name: 'Confirmar ubicación' }))
  await screenShown('Tipo de propiedad')
}

/** Pantalla 1: la ubicación, confirmada en el mapa. Termina en la pantalla del tipo de propiedad. */
export const fillLocationScreen = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  await fillAddress(user)
  await confirmLocationOnMap(user, fakeMap)
}

/** Pantalla 2: una casa con sus medidas. */
export const fillTypeScreen = async (user: UserEvent) => {
  await user.click(screen.getByRole('radio', { name: 'Casa' }))
  await typeIn(user, 'spinbutton', 'Superficie construida (m²)', listing.builtArea ?? '')
  await typeIn(user, 'spinbutton', 'Superficie del terreno (m²)', listing.landArea ?? '')
  await typeIn(user, 'spinbutton', 'Cuartos', listing.bedrooms ?? '')
  await typeIn(user, 'spinbutton', 'Baños', listing.bathrooms ?? '')
}

/** Pantalla 3: título y descripción del anuncio. */
export const fillListingScreen = async (user: UserEvent) => {
  await typeIn(user, 'textbox', 'Título de la publicación', listing.title)
  await typeIn(user, 'textbox', 'Descripción', listing.description)
}

/** Pantalla 4: venta, con su precio. */
export const fillPricingScreen = async (user: UserEvent) => {
  await user.click(screen.getByRole('radio', { name: 'Venta' }))
  await typeIn(user, 'spinbutton', 'Precio (USD)', listing.price)
}

/** Pantalla 5: una foto. */
export const addPhoto = (user: UserEvent) => user.upload(screen.getByLabelText('Agregar fotos'), PHOTO)

export const goNext = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Siguiente' }))
export const goBack = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Atrás' }))

/** Rellena las pantallas anteriores a la indicada y se queda en ella, sin rellenarla. */
export const goToScreen = async (
  user: UserEvent,
  fakeMap: FakeLocationMap,
  target: 'Tipo de propiedad' | 'Título y descripción' | 'Venta o alquiler' | 'Fotos',
) => {
  await fillLocationScreen(user, fakeMap)
  if (target === 'Tipo de propiedad') return

  await fillTypeScreen(user)
  await goNext(user)
  if (target === 'Título y descripción') return

  await fillListingScreen(user)
  await goNext(user)
  if (target === 'Venta o alquiler') return

  await fillPricingScreen(user)
  await goNext(user)
}

/** Recorre las cinco pantallas rellenándolas como lo haría una persona; queda en la última, listo para publicar. */
export const fillPublicationForm = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  await goToScreen(user, fakeMap, 'Fotos')
  await addPhoto(user)
}
