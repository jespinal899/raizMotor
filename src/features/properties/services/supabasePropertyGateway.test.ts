import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { createSupabasePropertyGateway } from '@/features/properties/services/supabasePropertyGateway'
import type { CatalogSearch } from '@/features/properties/services/supabasePropertyRepository'

type Call = [method: string, ...args: unknown[]]

interface Answer {
  data?: unknown
  count?: number | null
  error?: { code: string; message: string } | null
}

/**
 * Un cliente de Supabase de mentira: anota cada consulta como la lista de llamadas que la forman y responde,
 * en orden, lo que diga la prueba.
 */
const fakeClient = (...answers: Answer[]) => {
  const queries: Call[][] = []

  const from = (table: string) => {
    const calls: Call[] = [['from', table]]
    queries.push(calls)
    const answer = answers[queries.length - 1] ?? {}
    const builder: Record<string, unknown> = {
      then: (resolve: (value: unknown) => unknown) =>
        resolve({ data: answer.data ?? null, count: answer.count ?? null, error: answer.error ?? null }),
    }
    for (const method of ['select', 'eq', 'ilike', 'gte', 'lte', 'order', 'range']) {
      builder[method] = (...args: unknown[]) => {
        calls.push([method, ...args])
        return builder
      }
    }

    return builder
  }

  return { client: { from } as unknown as SupabaseClient, queries }
}

const SEARCH: CatalogSearch = { offset: 0, limit: 6 }

describe('createSupabasePropertyGateway: searchPublished', () => {
  it('sin filtros pide los publicados, del más reciente al más antiguo, solo el tramo pedido y cuántos son', async () => {
    // Arrange
    const { client, queries } = fakeClient({ data: [{ id: 'a' }], count: 9 })

    // Act
    const result = await createSupabasePropertyGateway(client).searchPublished({ offset: 6, limit: 6 })

    // Assert
    expect(result).toEqual({ rows: [{ id: 'a' }], total: 9 })
    expect(queries[0]).toEqual([
      ['from', 'properties'],
      ['select', '*', { count: 'exact', head: false }],
      ['eq', 'status', 'published'],
      ['order', 'created_at', { ascending: false, nullsFirst: false }],
      ['order', 'created_at', { ascending: false }],
      ['order', 'id', { ascending: true }],
      ['range', 6, 11],
    ])
  })

  it('aplica cada filtro en la base de datos', async () => {
    // Arrange
    const { client, queries } = fakeClient({ data: [], count: 0 })
    const search: CatalogSearch = {
      ...SEARCH,
      type: 'casa',
      operation: 'alquiler',
      place: 'palmira',
      minPrice: 500,
      maxPrice: 1500,
      minBedrooms: 2,
      minBathrooms: 1,
    }

    // Act
    await createSupabasePropertyGateway(client).searchPublished(search)

    // Assert
    expect(queries[0]).toEqual(
      expect.arrayContaining([
        ['eq', 'type', 'casa'],
        ['eq', 'operation', 'alquiler'],
        ['ilike', 'search_place', '%palmira%'],
        ['gte', 'price', 500],
        ['lte', 'price', 1500],
        ['gte', 'bedrooms', 2],
        ['gte', 'bathrooms', 1],
      ]),
    )
  })

  it('un mínimo de cero cuartos deja fuera lo que no los declara, como al filtrar en el navegador', async () => {
    // Arrange
    const { client, queries } = fakeClient({ data: [], count: 0 })

    // Act
    await createSupabasePropertyGateway(client).searchPublished({ ...SEARCH, minBedrooms: 0 })

    // Assert
    expect(queries[0]).toContainEqual(['gte', 'bedrooms', 0])
  })

  it.each([
    ['price-asc', 'price', true],
    ['price-desc', 'price', false],
    ['area-desc', 'area', false],
  ] as const)('ordena por %s en la base de datos', async (sort, column, ascending) => {
    // Arrange
    const { client, queries } = fakeClient({ data: [], count: 0 })

    // Act
    await createSupabasePropertyGateway(client).searchPublished({ ...SEARCH, sort })

    // Assert
    expect(queries[0]).toContainEqual(['order', column, { ascending, nullsFirst: false }])
  })

  it('si el tramo empieza después del último anuncio, dice cuántos hay para ajustar la página', async () => {
    // Arrange
    const { client, queries } = fakeClient(
      { error: { code: 'PGRST103', message: 'Requested range not satisfiable' } },
      { count: 4 },
    )

    // Act
    const result = await createSupabasePropertyGateway(client).searchPublished({ ...SEARCH, type: 'casa', offset: 12 })

    // Assert
    expect(result).toEqual({ rows: [], total: 4 })
    expect(queries[1]).toEqual([
      ['from', 'properties'],
      ['select', '*', { count: 'exact', head: true }],
      ['eq', 'status', 'published'],
      ['eq', 'type', 'casa'],
    ])
  })

  it('cualquier otro fallo se entrega tal cual', async () => {
    // Arrange
    const failure = { code: '57014', message: 'canceling statement due to statement timeout' }
    const { client } = fakeClient({ error: failure })

    // Act
    const result = createSupabasePropertyGateway(client).searchPublished(SEARCH)

    // Assert
    await expect(result).rejects.toEqual(failure)
  })
})
