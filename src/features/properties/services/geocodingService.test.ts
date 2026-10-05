import { describe, expect, it, vi } from 'vitest'
import { createNominatimGeocodingService } from '@/features/properties/services/geocodingService'

const QUERY = { neighborhood: 'Colonia Palmira', city: 'Tegucigalpa', department: 'Francisco Morazán' }

const respondWith = (results: unknown, ok = true) => ({ ok, json: async () => results }) as Response
const found = (lat: string, lon: string) => respondWith([{ lat, lon }])
const nothing = () => respondWith([])

const setup = (...responses: Response[]) => {
  const fetchFn = vi.fn<typeof fetch>()
  responses.forEach((response) => fetchFn.mockResolvedValueOnce(response))
  const wait = vi.fn(async () => {})
  const service = createNominatimGeocodingService({ fetch: fetchFn, wait })
  const searched = () => fetchFn.mock.calls.map(([url]) => new URL(String(url)))

  return { service, fetchFn, wait, searched }
}

describe('createNominatimGeocodingService', () => {
  it('busca primero la colonia dentro de su ciudad y devuelve su punto', async () => {
    // Arrange
    const { service, searched } = setup(found('14.1021', '-87.1897'))

    // Act
    const located = await service.locate(QUERY)

    // Assert
    expect(located).toEqual({ point: { lat: 14.1021, lng: -87.1897 }, precision: 'neighborhood' })
    expect(searched()).toHaveLength(1)
    expect(searched()[0].searchParams.get('q')).toBe('Colonia Palmira, Tegucigalpa, Francisco Morazán, Honduras')
  })

  it('consulta el buscador de OpenStreetMap, solo en Honduras, pidiendo un resultado en español', async () => {
    // Arrange
    const { service, searched } = setup(found('14.1', '-87.2'))

    // Act
    await service.locate(QUERY)

    // Assert
    const [url] = searched()
    expect(url.origin + url.pathname).toBe('https://nominatim.openstreetmap.org/search')
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'hn',
      'accept-language': 'es',
    })
  })

  it('si no encuentra la colonia, busca la ciudad, respetando la pausa que pide el buscador', async () => {
    // Arrange
    const { service, searched, wait } = setup(nothing(), found('14.0723', '-87.1921'))

    // Act
    const located = await service.locate(QUERY)

    // Assert
    expect(located).toEqual({ point: { lat: 14.0723, lng: -87.1921 }, precision: 'city' })
    expect(searched()[1].searchParams.get('q')).toBe('Tegucigalpa, Francisco Morazán, Honduras')
    expect(wait).toHaveBeenCalledExactlyOnceWith(1000)
  })

  it('si tampoco encuentra la ciudad, no devuelve ningún punto', async () => {
    // Arrange
    const { service, fetchFn } = setup(nothing(), nothing())

    // Act
    const located = await service.locate(QUERY)

    // Assert
    expect(located).toBeUndefined()
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('trata como no encontrada una respuesta con coordenadas que no son números', async () => {
    // Arrange
    const { service } = setup(found('norte', 'oeste'), nothing())

    // Act
    const located = await service.locate(QUERY)

    // Assert
    expect(located).toBeUndefined()
  })

  it('falla cuando el buscador responde con un error, para que quien lo usa pueda reaccionar', async () => {
    // Arrange
    const { service } = setup(respondWith(null, false))

    // Act
    const locating = service.locate(QUERY)

    // Assert
    await expect(locating).rejects.toThrow('El buscador de direcciones no respondió.')
  })
})

describe('createNominatimGeocodingService: repetir una búsqueda', () => {
  it('no vuelve a consultar el buscador: devuelve la respuesta que ya tenía', async () => {
    // Arrange
    const { service, fetchFn } = setup(found('14.1021', '-87.1897'))
    const first = await service.locate(QUERY)

    // Act
    const second = await service.locate(QUERY)

    // Assert
    expect(second).toEqual(first)
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  it('dos búsquedas iguales a la vez comparten una sola consulta', async () => {
    // Arrange
    const { service, fetchFn } = setup(found('14.1021', '-87.1897'))

    // Act
    const [first, second] = await Promise.all([service.locate(QUERY), service.locate(QUERY)])

    // Assert
    expect(second).toEqual(first)
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  it('trata como la misma búsqueda las que solo cambian en mayúsculas o espacios', async () => {
    // Arrange
    const { service, fetchFn } = setup(found('14.1021', '-87.1897'))
    await service.locate(QUERY)

    // Act
    await service.locate({ ...QUERY, neighborhood: '  colonia PALMIRA ' })

    // Assert
    expect(fetchFn).toHaveBeenCalledOnce()
  })

  it('también recuerda que una dirección no se encontró', async () => {
    // Arrange
    const { service, fetchFn } = setup(nothing(), nothing())
    await service.locate(QUERY)

    // Act
    const located = await service.locate(QUERY)

    // Assert
    expect(located).toBeUndefined()
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('una búsqueda que falló no se recuerda: al repetirla vuelve a consultar', async () => {
    // Arrange
    const { service, fetchFn } = setup(respondWith(null, false), found('14.1021', '-87.1897'))
    await service.locate(QUERY).catch(() => undefined)

    // Act
    const located = await service.locate(QUERY)

    // Assert
    expect(located).toEqual({ point: { lat: 14.1021, lng: -87.1897 }, precision: 'neighborhood' })
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('una dirección distinta sí se consulta', async () => {
    // Arrange
    const { service, fetchFn } = setup(found('14.1021', '-87.1897'), found('15.5042', '-88.025'))
    await service.locate(QUERY)

    // Act
    const located = await service.locate({ neighborhood: 'Colonia Trejo', city: 'San Pedro Sula', department: 'Cortés' })

    // Assert
    expect(located?.point).toEqual({ lat: 15.5042, lng: -88.025 })
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})
