import { act, screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
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

/** Pega el texto de una vez: escribirlo tecla a tecla en un formulario tan largo haría lentas las pruebas. */
const typeIn = async (user: UserEvent, role: 'textbox' | 'spinbutton', name: string, text: string | number) => {
  await user.click(screen.getByRole(role, { name }))
  await user.paste(String(text))
}

/** Rellena el formulario de publicación como lo haría una persona: una casa en venta en San Pedro Sula. */
export const fillPublicationForm = async (user: UserEvent, fakeMap: FakeLocationMap) => {
  const { location, ...listing } = FILLED_PUBLICATION

  await user.click(screen.getByRole('combobox', { name: 'Departamento' }))
  await user.click(await screen.findByRole('option', { name: 'Cortés' }))
  await typeIn(user, 'textbox', 'Ciudad', location.city)
  await typeIn(user, 'textbox', 'Colonia o barrio', location.neighborhood)
  await typeIn(user, 'textbox', 'Dirección', location.address)
  act(() => fakeMap.moveTo(location.coordinates))

  await user.click(screen.getByRole('radio', { name: 'Casa' }))
  await typeIn(user, 'spinbutton', 'Superficie construida (m²)', listing.builtArea ?? '')
  await typeIn(user, 'spinbutton', 'Superficie del terreno (m²)', listing.landArea ?? '')
  await typeIn(user, 'spinbutton', 'Cuartos', listing.bedrooms ?? '')
  await typeIn(user, 'spinbutton', 'Baños', listing.bathrooms ?? '')

  await typeIn(user, 'textbox', 'Título de la publicación', listing.title)
  await typeIn(user, 'textbox', 'Descripción', listing.description)
  await user.click(screen.getByRole('radio', { name: 'Venta' }))
  await typeIn(user, 'spinbutton', 'Precio (USD)', listing.price)

  await user.upload(screen.getByLabelText('Agregar fotos'), PHOTO)
}
