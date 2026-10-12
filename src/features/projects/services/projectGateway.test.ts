import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { createSupabaseProjectGateway } from '@/features/projects/services/projectGateway'

const clientWith = (rpcAnswer: { data: unknown; error: unknown }) => {
  const rpc = vi.fn(async () => rpcAnswer)
  const getPublicUrl = vi.fn((path: string) => ({ data: { publicUrl: `https://deposito.example/${path}` } }))
  const client = { rpc, storage: { from: vi.fn(() => ({ getPublicUrl })) } } as unknown as SupabaseClient

  return { client, rpc }
}

describe('createSupabaseProjectGateway', () => {
  it('pide los destacados a la función de la base de datos, con la cantidad que caben en la portada', async () => {
    // Arrange
    const rows = [{ id: 'destacado' }]
    const { client, rpc } = clientWith({ data: rows, error: null })

    // Act
    const featured = await createSupabaseProjectGateway(client).listFeatured(6)

    // Assert
    expect(rpc).toHaveBeenCalledExactlyOnceWith('featured_projects', { max_count: 6 })
    expect(featured).toEqual(rows)
  })

  it('si la base de datos falla, lo entrega tal cual', async () => {
    // Arrange
    const failure = { code: 'PGRST202', message: 'no existe la función' }
    const { client } = clientWith({ data: null, error: failure })

    // Act
    const featured = createSupabaseProjectGateway(client).listFeatured(6)

    // Assert
    await expect(featured).rejects.toBe(failure)
  })

  it('una foto guardada en el depósito se pide por su dirección pública; una dirección completa se usa tal cual', () => {
    // Arrange
    const { client } = clientWith({ data: null, error: null })
    const gateway = createSupabaseProjectGateway(client)

    // Act
    const stored = gateway.photoUrl('torre/portada.webp')
    const external = gateway.photoUrl('https://fotos.example/render.webp')

    // Assert
    expect(stored).toBe('https://deposito.example/torre/portada.webp')
    expect(external).toBe('https://fotos.example/render.webp')
  })
})
