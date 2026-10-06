import { describe, expect, it } from 'vitest'
import {
  createBrowserPropertyViewService,
  propertyViewService,
} from '@/features/properties/services/propertyViewService'
import { memoryStorage } from '@/test/memoryStorage'

/** Un navegador de prueba: `newVisit` lo deja como al abrir otra pestaña, con el total ya guardado. */
const setup = (counts: Storage = memoryStorage()) => {
  let visits = memoryStorage()
  const service = createBrowserPropertyViewService({ counts: () => counts, visits: () => visits })
  const newVisit = () => {
    visits = memoryStorage()
  }

  return { service, newVisit }
}

/** Almacén que devuelve siempre lo mismo, como si lo guardado viniera de otra versión o estuviera dañado. */
const storageHolding = (stored: string): Storage => ({ ...memoryStorage(), getItem: () => stored })

describe('createBrowserPropertyViewService', () => {
  it('la primera visita a una ficha cuenta una vista', async () => {
    // Arrange
    const { service } = setup()

    // Act
    const views = await service.registerView('casa-1')

    // Assert
    expect(views).toBe(1)
  })

  it('repetirla en la misma visita, como al recargar, no vuelve a contar', async () => {
    // Arrange
    const { service } = setup()
    await service.registerView('casa-1')

    // Act
    const views = await service.registerView('casa-1')

    // Assert
    expect(views).toBe(1)
  })

  it('una visita nueva suma otra vista al total guardado', async () => {
    // Arrange
    const { service, newVisit } = setup()
    await service.registerView('casa-1')
    newVisit()

    // Act
    const views = await service.registerView('casa-1')

    // Assert
    expect(views).toBe(2)
  })

  it('cada ficha lleva su propia cuenta', async () => {
    // Arrange
    const { service, newVisit } = setup()
    await service.registerView('casa-1')
    newVisit()
    await service.registerView('casa-1')

    // Act
    const views = await service.registerView('casa-2')

    // Assert
    expect(views).toBe(1)
  })

  it('ver otra ficha no hace olvidar que la primera ya se contó en esta visita', async () => {
    // Arrange
    const { service } = setup()
    await service.registerView('casa-1')
    await service.registerView('casa-2')

    // Act
    const views = await service.registerView('casa-1')

    // Assert
    expect(views).toBe(1)
  })

  it.each([
    ['no es JSON', '{dañado'],
    ['no es una lista de totales', '[3, 4]'],
    ['trae un total que no es un número', '{"casa-1":"muchas"}'],
    ['trae un total negativo', '{"casa-1":-5}'],
  ])('si lo guardado %s, empieza de nuevo en lugar de fallar', async (_case, stored) => {
    // Arrange
    const { service } = setup(storageHolding(stored))

    // Act
    const views = await service.registerView('casa-1')

    // Assert
    expect(views).toBe(1)
  })

  it('no confunde un identificador con algo que todo objeto ya trae', async () => {
    // Arrange
    const { service } = setup()

    // Act
    const views = await service.registerView('constructor')

    // Assert
    expect(views).toBe(1)
  })

  it('si el navegador no deja guardar, lo rechaza: no hay total que mostrar', async () => {
    // Arrange
    const blocked = () => {
      throw new DOMException('El acceso al almacenamiento está bloqueado', 'SecurityError')
    }
    const service = createBrowserPropertyViewService({ counts: blocked, visits: blocked })

    // Act
    const counting = service.registerView('casa-1')

    // Assert
    await expect(counting).rejects.toThrow('bloqueado')
  })
})

describe('propertyViewService', () => {
  it('el servicio de la aplicación cuenta en este navegador, una vez por visita', async () => {
    // Arrange
    await propertyViewService.registerView('casa-1')

    // Act
    const views = await propertyViewService.registerView('casa-1')

    // Assert
    expect(views).toBe(1)
    expect(Object.keys(localStorage)).toHaveLength(1)
    expect(Object.keys(sessionStorage)).toHaveLength(1)
  })
})
