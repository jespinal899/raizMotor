import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { createOperationKey } from '@/shared/utils/operationKey'

const DATABASE_NAME = 'domus-raiz-properties'
const DATABASE_VERSION = 1
const STORE_NAME = 'publications'
const OPERATION_INDEX = 'operationKey'

export interface StoredPropertyPublication {
  id: string
  operationKey: string
  createdAt: number
  publication: PropertyPublication
}

export interface PublishedPropertyRepository {
  publish(publication: PropertyPublication, operationKey: string): Promise<string>
  getById(id: string): Promise<StoredPropertyPublication | undefined>
  /** Del más reciente al más antiguo. */
  getAll(): Promise<StoredPropertyPublication[]>
}

interface RepositoryOptions {
  getFactory?: () => IDBFactory | undefined
  createId?: () => string
  now?: () => number
}

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

/** Repositorio local: IndexedDB conserva tanto los datos como los archivos de imagen. */
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

    getAll: async () => {
      const db = await getDatabase()

      return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
        request.onsuccess = () => {
          const records = request.result as StoredPropertyPublication[]
          resolve(records.toSorted((left, right) => right.createdAt - left.createdAt))
        }
        request.onerror = () => reject(requestError(request))
      })
    },
  }
}

export const publishedPropertyRepository = createIndexedDbPublicationRepository()
