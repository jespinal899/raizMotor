import { describe, expect, it } from 'vitest'
import type { StoredPublication } from '@/features/properties/services/publishedPropertyRepository'
import { toFormValues } from '@/features/properties/utils/toFormValues'
import { toPublication } from '@/features/properties/utils/toPublication'
import { buildPublicationValues } from '@/test/factories'

const SAVED_PHOTO = 'https://fotos.example/portada.webp'

/** Un anuncio tal como queda guardado: sus fotos ya son direcciones. */
const savedAd = (overrides: Partial<StoredPublication> = {}): StoredPublication => ({
  ...toPublication(buildPublicationValues()),
  images: [SAVED_PHOTO],
  ...overrides,
})

describe('toFormValues', () => {
  it('deja el formulario como estaba al publicar: los números como texto y la ubicación ya confirmada', () => {
    // Arrange
    const expected = buildPublicationValues({ images: [SAVED_PHOTO] })

    // Act
    const values = toFormValues(savedAd())

    // Assert
    expect(values).toEqual(expected)
  })

  it('lo que el anuncio no declara queda en blanco, no en cero', () => {
    // Arrange
    const land = savedAd({ type: 'terreno', builtArea: undefined, bedrooms: undefined, bathrooms: undefined, parking: undefined })

    // Act
    const values = toFormValues(land)

    // Assert
    expect(values).toMatchObject({ type: 'terreno', builtArea: '', bedrooms: '', bathrooms: '', parking: '', landArea: '250' })
  })

  it('editar lo que entrega y volver a guardarlo no cambia el anuncio', () => {
    // Arrange
    const saved = savedAd({ parking: 2, features: ['Jardín'] })

    // Act
    const roundTrip = toPublication(toFormValues(saved))

    // Assert
    expect(roundTrip).toEqual(saved)
  })
})
