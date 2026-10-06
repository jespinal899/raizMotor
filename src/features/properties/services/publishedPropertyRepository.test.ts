import { describe, expect, it, vi } from 'vitest'
import {
  createIndexedDbPublicationRepository,
  type StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import { buildPublicationValues } from '@/test/factories'
import { toPublication } from '@/features/properties/utils/toPublication'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

interface FakeRequest<T> {
  result?: T
  error?: DOMException | null
  onsuccess?: () => void
  onerror?: () => void
  onupgradeneeded?: () => void
  transaction?: FakeTransaction
}

interface DatabaseState {
  records: Map<string, StoredPropertyPublication>
  indexes: Set<string>
}

class FakeTransaction {
  oncomplete?: () => void
  onerror?: () => void
  onabort?: () => void
  error: DOMException | null = null
  private pending = 0
  private readonly state: DatabaseState

  constructor(state: DatabaseState) {
    this.state = state
  }

  objectStore = () => new FakeObjectStore(this.state, this)

  request = <T>(read: () => T): FakeRequest<T> => {
    const result: FakeRequest<T> = {}
    this.pending += 1
    queueMicrotask(() => {
      try {
        result.result = read()
        result.onsuccess?.()
        this.pending -= 1
        if (this.pending === 0) queueMicrotask(() => this.oncomplete?.())
      } catch (error) {
        this.error = error instanceof DOMException ? error : new DOMException('Fallo de prueba')
        result.error = this.error
        result.onerror?.()
        this.onabort?.()
      }
    })
    return result
  }
}

class FakeObjectStore {
  indexNames = { contains: (name: string) => this.state.indexes.has(name) }
  private readonly state: DatabaseState
  private readonly transaction: FakeTransaction

  constructor(state: DatabaseState, transaction: FakeTransaction) {
    this.state = state
    this.transaction = transaction
  }

  createIndex = (name: string) => this.state.indexes.add(name)

  index = () => ({
    get: (operationKey: string) =>
      this.transaction.request(() => [...this.state.records.values()].find((item) => item.operationKey === operationKey)),
  })

  add = (record: StoredPropertyPublication) =>
    this.transaction.request(() => {
      if ([...this.state.records.values()].some((item) => item.operationKey === record.operationKey)) {
        throw new DOMException('Clave de operación duplicada', 'ConstraintError')
      }
      this.state.records.set(record.id, record)
    })

  get = (id: string) => this.transaction.request(() => this.state.records.get(id))

  getAll = () => this.transaction.request(() => [...this.state.records.values()])
}

const buildIndexedDb = () => {
  let state: DatabaseState | undefined
  const database = {
    objectStoreNames: { contains: (name: string) => name === 'publications' && state !== undefined },
    createObjectStore: () => new FakeObjectStore(state!, new FakeTransaction(state!)),
    transaction: () => new FakeTransaction(state!),
    close: vi.fn(),
  }
  const factory = {
    open: () => {
      const request: FakeRequest<typeof database> = {}
      queueMicrotask(() => {
        if (!state) {
          state = { records: new Map(), indexes: new Set() }
          request.result = database
          request.transaction = new FakeTransaction(state)
          request.onupgradeneeded?.()
        }
        request.result = database
        request.onsuccess?.()
      })
      return request
    },
  }

  return factory as unknown as IDBFactory
}

const PUBLICATION = toPublication(buildPublicationValues())

describe('publishedPropertyRepository', () => {
  it('guarda las imágenes y devuelve el mismo anuncio para una clave repetida', async () => {
    // Arrange
    const factory = buildIndexedDb()
    const createId = vi.fn(() => 'casa-publicada')
    const repository = createIndexedDbPublicationRepository({ getFactory: () => factory, createId })

    // Act
    const firstId = await repository.publish(PUBLICATION, TEST_OPERATION_KEY)
    const retryId = await repository.publish({ ...PUBLICATION, title: 'No duplica el reintento' }, TEST_OPERATION_KEY)
    const reloadedRepository = createIndexedDbPublicationRepository({ getFactory: () => factory })
    const stored = await reloadedRepository.getById(firstId)
    const all = await reloadedRepository.getAll()

    // Assert
    expect(firstId).toBe('casa-publicada')
    expect(retryId).toBe(firstId)
    expect(createId).toHaveBeenCalledOnce()
    expect(stored?.publication.title).toBe(PUBLICATION.title)
    expect(stored?.publication.images[0]).toBeInstanceOf(File)
    expect(all).toHaveLength(1)
  })

  it('rechaza si IndexedDB no está disponible', async () => {
    // Arrange
    const repository = createIndexedDbPublicationRepository({ getFactory: () => undefined })

    // Act
    const saving = repository.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(saving).rejects.toThrow('Este navegador no permite guardar publicaciones.')
  })
})
