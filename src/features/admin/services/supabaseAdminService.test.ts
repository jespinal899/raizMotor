import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { createSupabaseAdminService } from '@/features/admin/services/supabaseAdminService'

type Call = [method: string, ...args: unknown[]]

interface Answer {
  data?: unknown
  count?: number | null
  error?: { code: string } | null
}

const PAGE = { page: 2, pageSize: 20 }

/**
 * Un cliente de Supabase de mentira: anota cada consulta y cada llamada a una función de la base, y responde
 * en orden lo que diga la prueba.
 */
const fakeClient = ({ answers = [] as Answer[], session = true, rpc = { data: null, error: null } as Answer } = {}) => {
  const queries: Call[][] = []
  const respond = (answer: Answer = {}) => ({ data: answer.data ?? null, count: answer.count ?? null, error: answer.error ?? null })

  const from = (table: string) => {
    const calls: Call[] = [['from', table]]
    const answer = answers[queries.length]
    queries.push(calls)
    const builder: Record<string, unknown> = { then: (resolve: (value: unknown) => unknown) => resolve(respond(answer)) }
    for (const method of ['select', 'eq', 'ilike', 'order', 'range']) {
      builder[method] = (...args: unknown[]) => {
        calls.push([method, ...args])
        return builder
      }
    }

    return builder
  }

  const client = {
    from,
    rpc: vi.fn(async () => respond(rpc)),
    auth: { getSession: vi.fn(async () => ({ data: { session: session ? { user: { id: 'equipo' } } : null } })) },
  }

  return { client: client as unknown as SupabaseClient, rpc: client.rpc, queries }
}

describe('createSupabaseAdminService: isAdmin', () => {
  it('sin sesión no es del equipo, y no pregunta a la base', async () => {
    // Arrange
    const { client, rpc } = fakeClient({ session: false })

    // Act
    const isAdmin = await createSupabaseAdminService(client).isAdmin()

    // Assert
    expect(isAdmin).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })

  it.each([
    [true, true],
    [false, false],
  ])('con sesión pregunta a la base; si responde %s, es del equipo: %s', async (answer, expected) => {
    // Arrange
    const { client, rpc } = fakeClient({ rpc: { data: answer } })

    // Act
    const isAdmin = await createSupabaseAdminService(client).isAdmin()

    // Assert
    expect(rpc).toHaveBeenCalledExactlyOnceWith('is_admin')
    expect(isAdmin).toBe(expected)
  })
})

describe('createSupabaseAdminService: listas', () => {
  it('un reporte de un proyecto trae el proyecto, y no un anuncio', async () => {
    // Arrange
    const row = {
      id: 'reporte-2',
      reason: 'misleading',
      details: 'Los renders no son del proyecto',
      status: 'open',
      created_at: '2026-10-18T10:00:00Z',
      property: null,
      project: { id: 'proyecto-1', name: 'Torre Vista', status: 'published' },
    }
    const { client } = fakeClient({ answers: [{ data: [row], count: 1 }] })

    // Act
    const { items } = await createSupabaseAdminService(client).listReports('open', { page: 1, pageSize: 20 })

    // Assert
    expect(items[0]).toMatchObject({ property: null, project: { id: 'proyecto-1', name: 'Torre Vista', status: 'published' } })
  })

  it('lee los proyectos con el estado y el nombre pedidos', async () => {
    // Arrange
    const row = {
      id: 'proyecto-1',
      name: 'Torre Vista',
      status: 'hidden',
      developer_name: 'Constructora Norte',
      developer_phone: '+50499998888',
      city: 'San Pedro Sula',
      price_from: 89000,
      created_at: '2026-10-15T12:00:00Z',
    }
    const { client, queries } = fakeClient({ answers: [{ data: [row], count: 1 }] })

    // Act
    const { items } = await createSupabaseAdminService(client).listProjects({ status: 'hidden', search: 'torre' }, { page: 1, pageSize: 20 })

    // Assert
    expect(queries[0]).toEqual(
      expect.arrayContaining([
        ['from', 'projects'],
        ['eq', 'status', 'hidden'],
        ['ilike', 'name', '%torre%'],
      ]),
    )
    expect(items[0]).toEqual({
      id: 'proyecto-1',
      name: 'Torre Vista',
      status: 'hidden',
      developerName: 'Constructora Norte',
      developerPhone: '+50499998888',
      city: 'San Pedro Sula',
      priceFrom: 89000,
      createdAt: '2026-10-15T12:00:00Z',
    })
  })

  it('lee los reportes del estado pedido, del más reciente al más antiguo, con el anuncio de cada uno', async () => {
    // Arrange
    const row = {
      id: 'reporte-1',
      reason: 'fraud',
      details: '',
      status: 'open',
      created_at: '2026-10-11T15:30:00Z',
      property: [{ id: 'anuncio-1', title: 'Casa en Palmira', status: 'published' }],
    }
    const { client, queries } = fakeClient({ answers: [{ data: [row], count: 21 }] })

    // Act
    const result = await createSupabaseAdminService(client).listReports('open', PAGE)

    // Assert
    expect(queries[0]).toEqual(
      expect.arrayContaining([
        ['from', 'property_reports'],
        ['eq', 'status', 'open'],
        ['order', 'created_at', { ascending: false }],
        ['range', 20, 39],
      ]),
    )
    expect(result).toEqual({
      items: [
        {
          id: 'reporte-1',
          reason: 'fraud',
          details: '',
          status: 'open',
          createdAt: '2026-10-11T15:30:00Z',
          property: { id: 'anuncio-1', title: 'Casa en Palmira', status: 'published' },
          project: null,
        },
      ],
      total: 21,
      page: 2,
      pageSize: 20,
      totalPages: 2,
    })
  })

  it('si la página ya no existe, entrega una vacía con el total, para volver a la última', async () => {
    // Arrange
    const { client } = fakeClient({ answers: [{ error: { code: 'PGRST103' } }, { count: 3 }] })

    // Act
    const result = await createSupabaseAdminService(client).listReports('open', PAGE)

    // Assert
    expect(result).toMatchObject({ items: [], total: 3, totalPages: 1 })
  })

  it('filtra los anuncios por estado y por un trozo del título, sin comodines', async () => {
    // Arrange
    const { client, queries } = fakeClient({ answers: [{ data: [], count: 0 }] })

    // Act
    await createSupabaseAdminService(client).listListings({ status: 'hidden', search: ' casa%_ ' }, PAGE)

    // Assert
    expect(queries[0]).toEqual(
      expect.arrayContaining([
        ['from', 'properties'],
        ['eq', 'status', 'hidden'],
        ['ilike', 'title', '%casa%'],
      ]),
    )
  })

  it('lee las cuentas con su total, que viene en cada fila', async () => {
    // Arrange
    const row = {
      id: 'cuenta-1',
      email: 'ana@ejemplo.hn',
      first_name: 'Ana',
      last_name: 'Mejía',
      phone: '+50499999999',
      max_publications: 150,
      max_projects: 3,
      role: 'user',
      created_at: '2026-10-01T09:00:00Z',
      published_count: '3',
      project_count: '2',
      total_count: '41',
    }
    const { client, rpc } = fakeClient({ rpc: { data: [row] } })

    // Act
    const result = await createSupabaseAdminService(client).listAccounts(' ana ', PAGE)

    // Assert
    expect(rpc).toHaveBeenCalledExactlyOnceWith('admin_list_accounts', { search: 'ana', page_offset: 20, page_limit: 20 })
    expect(result.items[0]).toMatchObject({
      email: 'ana@ejemplo.hn',
      maxPublications: 150,
      maxProjects: 3,
      publishedCount: 3,
      projectCount: 2,
    })
    expect(result).toMatchObject({ total: 41, totalPages: 3 })
  })
})

describe('createSupabaseAdminService: decisiones', () => {
  it.each([
    ['revisar un reporte', 'admin_review_report', { target_report: 'r', decision: 'dismiss', review_note: 'n' }],
    ['ocultar un anuncio', 'admin_set_property_status', { target_property: 'p', new_status: 'hidden', review_note: 'n' }],
    ['ocultar un proyecto', 'admin_set_project_status', { target_project: 'pj', new_status: 'hidden', review_note: 'n' }],
    [
      'cambiar los límites',
      'admin_set_account_limits',
      { target_account: 'c', new_publications: 150, new_projects: 3, review_note: 'n' },
    ],
  ])('para %s llama a la función de la base que comprueba el papel', async (_case, fn, args) => {
    // Arrange
    const { client, rpc } = fakeClient()
    const service = createSupabaseAdminService(client)
    const actions: Record<string, () => Promise<void>> = {
      admin_review_report: () => service.reviewReport('r', 'dismiss', 'n'),
      admin_set_property_status: () => service.setListingStatus('p', 'hidden', 'n'),
      admin_set_account_limits: () => service.setAccountLimits('c', { publications: 150, projects: 3 }, 'n'),
      admin_set_project_status: () => service.setProjectStatus('pj', 'hidden', 'n'),
    }

    // Act
    await actions[fn]()

    // Assert
    expect(rpc).toHaveBeenCalledExactlyOnceWith(fn, args)
  })

  it('si la base la rechaza, por ejemplo porque la cuenta ya no es del equipo, se entrega el fallo', async () => {
    // Arrange
    const forbidden = { code: '42501' }
    const { client } = fakeClient({ rpc: { error: forbidden } })

    // Act
    const decision = createSupabaseAdminService(client).setListingStatus('p', 'hidden', '')

    // Assert
    await expect(decision).rejects.toBe(forbidden)
  })
})
