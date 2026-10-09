import type { Advertiser, PhotoSource, Withdrawal } from '@/features/properties/types/property.types'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { createOperationKey } from '@/shared/utils/operationKey'

const DATABASE_NAME = 'domus-raiz-properties'
const DATABASE_VERSION = 1
const STORE_NAME = 'publications'
const OPERATION_INDEX = 'operationKey'

/** Un anuncio ya guardado: sus fotos son los archivos, en este navegador, o sus direcciones, en el servidor. */
export type StoredPublication = Omit<PropertyPublication, 'images'> & { images: PhotoSource[] }

export interface StoredPropertyPublication {
  id: string
  operationKey: string
  createdAt: number
  publication: StoredPublication
  /** Quién lo publica, cuando el anuncio es de una cuenta. */
  advertiser?: Advertiser
  /** Fuera del catálogo, y por decisión de quién: solo lo sigue viendo quien lo publicó. */
  withdrawn?: Withdrawal
}

export interface PublishedPropertyRepository {
  /** Guarda el anuncio y devuelve su identificador. Repetir una clave devuelve el mismo, sin guardar otro. */
  publish(publication: PropertyPublication, operationKey: string): Promise<string>
  getById(id: string): Promise<StoredPropertyPublication | undefined>
  /** Los anuncios que puede ver quien usa el sitio, del más reciente al más antiguo. */
  getAll(): Promise<StoredPropertyPublication[]>
  /** Los de quien usa el sitio, también los que no están en el catálogo, del más reciente al más antiguo. */
  getOwn(): Promise<StoredPropertyPublication[]>
  /** Cuántos anuncios puede tener publicados a la vez quien usa el sitio. */
  getLimit(): Promise<number>
  /**
   * Guarda los cambios de un anuncio propio; guardar otra vez los mismos lo deja igual. Rechaza si el
   * anuncio no existe o no es de quien usa el sitio.
   */
  update(id: string, publication: PropertyPublication, operationKey: string): Promise<void>
  /**
   * Retira del catálogo un anuncio propio, que conserva todo lo demás; repetirlo lo deja igual. Rechaza si
   * el anuncio no existe o no es de quien usa el sitio.
   */
  unpublish(id: string): Promise<void>
  /**
   * Devuelve al catálogo un anuncio propio que su dueño había retirado; repetirlo lo deja igual. Rechaza
   * igual que `unpublish`, y con `PublicationLimitError` si quien lo guarda sabe que el plan ya está lleno.
   */
  republish(id: string): Promise<void>
  /** Elimina un anuncio propio. Repetirlo, o pedirlo de uno ajeno, no hace nada. */
  remove(id: string): Promise<void>
}

interface RepositoryOptions {
  getFactory?: () => IDBFactory | undefined
  createId?: () => string
  now?: () => number
}

/** Lo que se responde a quien quiere cambiar un anuncio que no puede cambiar. */
export const NOT_EDITABLE = 'El anuncio no existe o no es de esta cuenta.'

const requestError = (request: IDBRequest) => request.error ?? new Error('No se pudo completar la operación de almacenamiento.')

const transactionError = (transaction: IDBTransaction) =>
  transaction.error ?? new Error('No se pudo guardar la publicación en este navegador.')

const openDatabase = (factory: IDBFactory) =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      const store = database.objectStoreNames.contains(STORE_NAME)
        ? request.transaction!.objectStore(STORE_NAME)
        : database.createObjectStore(STORE_NAME, { keyPath: 'id' })

      if (!store.indexNames.contains(OPERATION_INDEX)) {
        store.createIndex(OPERATION_INDEX, OPERATION_INDEX, { unique: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(requestError(request))
    request.onblocked = () => reject(new Error('El almacenamiento de publicaciones está ocupado en otra pestaña.'))
  })

/**
 * Repositorio local: IndexedDB conserva tanto los datos como los archivos de imagen. Todo lo que guarda es
 * de quien usa este navegador, y sin cuentas no hay más plan que el gratuito.
 */
export const createIndexedDbPublicationRepository = ({
  getFactory = () => globalThis.indexedDB,
  // Misma fuente aleatoria que las claves de operación: funciona también sin HTTPS.
  createId = createOperationKey,
  now = Date.now,
}: RepositoryOptions = {}): PublishedPropertyRepository => {
  let database: Promise<IDBDatabase> | undefined

  const getDatabase = () => {
    if (!database) {
      const factory = getFactory()
      if (!factory) return Promise.reject(new Error('Este navegador no permite guardar publicaciones.'))

      database = openDatabase(factory).catch((error: unknown) => {
        database = undefined
        throw error
      })
    }

    return database
  }

  const readAll = async (): Promise<StoredPropertyPublication[]> => {
    const db = await getDatabase()

    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
      request.onsuccess = () => {
        const records = request.result as StoredPropertyPublication[]
        resolve(records.toSorted((left, right) => right.createdAt - left.createdAt))
      }
      request.onerror = () => reject(requestError(request))
    })
  }

  /** Cambia un anuncio guardado, que conserva lo que el cambio no toque. Rechaza si ya no existe. */
  const change = async (id: string, toNext: (record: StoredPropertyPublication) => StoredPropertyPublication) => {
    const db = await getDatabase()

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      let failure: unknown
      const existing = store.get(id)

      existing.onsuccess = () => {
        const record = existing.result as StoredPropertyPublication | undefined
        if (record) store.put(toNext(record))
        else failure = new Error(NOT_EDITABLE)
      }
      existing.onerror = () => {
        failure = requestError(existing)
      }
      transaction.oncomplete = () => (failure ? reject(failure) : resolve())
      transaction.onerror = () => reject(transactionError(transaction))
      transaction.onabort = () => reject(failure ?? transactionError(transaction))
    })
  }

  return {
    publish: async (publication, operationKey) => {
      const db = await getDatabase()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        let id: string | undefined
        let failure: unknown
        const existing = store.index(OPERATION_INDEX).get(operationKey)

        existing.onsuccess = () => {
          if (existing.result) {
            id = (existing.result as StoredPropertyPublication).id
            return
          }

          id = createId()
          const record: StoredPropertyPublication = { id, operationKey, createdAt: now(), publication }
          store.add(record)
        }
        existing.onerror = () => {
          failure = requestError(existing)
        }
        transaction.oncomplete = () => (failure ? reject(failure) : resolve(id!))
        transaction.onerror = () => reject(transactionError(transaction))
        transaction.onabort = () => reject(failure ?? transactionError(transaction))
      })
    },

    getById: async (id) => {
      const db = await getDatabase()

      return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id)
        request.onsuccess = () => resolve(request.result as StoredPropertyPublication | undefined)
        request.onerror = () => reject(requestError(request))
      })
    },

    // Lo despublicado sale del catálogo, pero sigue siendo de quien usa este navegador.
    getAll: async () => (await readAll()).filter((record) => !record.withdrawn),
    getOwn: readAll,
    getLimit: async () => MAX_FREE_PUBLICATIONS,

    // Se conservan su identificador, su clave y su fecha: solo cambia lo que se anuncia.
    update: (id, publication) => change(id, (record) => ({ ...record, publication })),
    unpublish: (id) => change(id, (record) => ({ ...record, withdrawn: 'byOwner' })),
    // El límite del plan lo comprueba quien pide publicar, igual que con un anuncio nuevo.
    republish: (id) => change(id, ({ withdrawn: _withdrawn, ...record }) => record),

    remove: async (id) => {
      const db = await getDatabase()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        // Borrar lo que ya no está no es un error: IndexedDB lo da por hecho.
        transaction.objectStore(STORE_NAME).delete(id)
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transactionError(transaction))
        transaction.onabort = () => reject(transactionError(transaction))
      })
    },
  }
}
