export interface PropertyViewService {
  /**
   * Cuenta la visita a la ficha y devuelve cuántas lleva. Es idempotente dentro de una misma visita:
   * recargar la página o pedirlo dos veces no vuelve a contar.
   */
  registerView(propertyId: string): Promise<number>
}

/**
 * Las dos memorias del navegador que usa el contador. Se piden al contar y no al cargar la aplicación,
 * porque solo acceder a ellas ya falla cuando el navegador las tiene bloqueadas.
 */
interface ViewStores {
  /** Sobrevive al cierre del navegador: el total de cada ficha. */
  counts: () => Storage
  /** Dura lo que la pestaña: las fichas que ya se contaron en esta visita. */
  visits: () => Storage
}

const COUNTS_KEY = 'domus-raiz-property-views'
const VISITS_KEY = 'domus-raiz-property-visits'

const BROWSER_STORES: ViewStores = {
  counts: () => localStorage,
  visits: () => sessionStorage,
}

/** Lo guardado puede venir de otra versión o estar dañado: si no se entiende, se empieza de nuevo. */
const readStored = (storage: Storage, key: string): unknown => {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

const readCounts = (storage: Storage): Record<string, unknown> => {
  const stored = readStored(storage, COUNTS_KEY)

  return typeof stored === 'object' && stored !== null && !Array.isArray(stored) ? { ...stored } : {}
}

const readVisits = (storage: Storage): unknown[] => {
  const stored = readStored(storage, VISITS_KEY)

  return Array.isArray(stored) ? stored : []
}

const countOf = (counts: Record<string, unknown>, propertyId: string): number => {
  const count = Object.hasOwn(counts, propertyId) ? counts[propertyId] : 0

  return typeof count === 'number' && Number.isInteger(count) && count > 0 ? count : 0
}

/**
 * Cuenta las visitas en este navegador. Mientras no haya servidor no se pueden sumar las de los demás
 * visitantes, y por eso la ficha aclara de dónde sale el total.
 */
export const createBrowserPropertyViewService = (stores: ViewStores = BROWSER_STORES): PropertyViewService => ({
  registerView: async (propertyId) => {
    const countStore = stores.counts()
    const visitStore = stores.visits()
    const counts = readCounts(countStore)
    const visits = readVisits(visitStore)
    const counted = countOf(counts, propertyId)

    // Ya contada en esta visita: repetirlo devuelve el mismo total.
    if (counted > 0 && visits.includes(propertyId)) return counted

    const total = counted + 1
    countStore.setItem(COUNTS_KEY, JSON.stringify({ ...counts, [propertyId]: total }))
    visitStore.setItem(VISITS_KEY, JSON.stringify([...new Set([...visits, propertyId])]))

    return total
  },
})

// Único punto donde se elige cómo se cuentan las visitas: con un servidor, el total será el de todos los visitantes.
export const propertyViewService: PropertyViewService = createBrowserPropertyViewService()
