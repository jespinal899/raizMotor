// La lógica de la limpieza de fotos huérfanas, sin nada propio de Deno ni de Supabase: así se prueba con
// Vitest (cleanup.test.ts). index.ts la conecta con la base de datos y con Storage.

/** Cuántas fotos se piden y se borran de una vez: el máximo que acepta Storage en un borrado. */
export const BATCH_SIZE = 1000
/** Tandas por ejecución: acota lo que se borra en un día. Lo que quede, sale al día siguiente. */
export const MAX_BATCHES = 10

export interface CleanupDependencies {
  /** Las rutas de hasta `limit` fotos que ningún anuncio usa (supabase/migrations, `orphan_photos`). */
  listOrphans: (limit: number) => Promise<string[]>
  /** Cuántas fotos sobran, sin borrar nada (`count_orphan_photos`). */
  countOrphans: () => Promise<number>
  /** Borra esas fotos del depósito, con la API de Storage, y dice cuántas borró de verdad. */
  removePhotos: (paths: string[]) => Promise<number>
  /** El secreto `CLEANUP_SECRET`: solo quien lo conoce, la tarea programada, puede pedir la limpieza. */
  secret: string
}

/** Compara sin delatar, por lo que tarda, cuántos caracteres acertó quien prueba claves. */
export const sameSecret = (given: string, expected: string): boolean => {
  if (given.length !== expected.length) return false

  let difference = 0
  for (let index = 0; index < given.length; index += 1) {
    difference |= given.charCodeAt(index) ^ expected.charCodeAt(index)
  }

  return difference === 0
}

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/**
 * Atiende la llamada de la tarea programada. Con `?dry_run=1` solo cuenta lo que borraría. Si no, borra por
 * tandas hasta que no quede nada o se llegue al máximo del día. En los registros queda cuántas, nunca cuáles.
 */
export const handleCleanup = async (request: Request, deps: CleanupDependencies): Promise<Response> => {
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' })
  if (!sameSecret(request.headers.get('x-cleanup-secret') ?? '', deps.secret)) return reply(401, { error: 'unauthorized' })

  const dryRun = new URL(request.url).searchParams.get('dry_run') === '1'
  if (dryRun) {
    try {
      const orphans = await deps.countOrphans()
      console.log(`cleanup-photos: prueba, sobran ${orphans} fotos.`)

      return reply(200, { dryRun: true, orphans })
    } catch (reason) {
      console.error(`cleanup-photos: no se pudo contar. ${(reason as Error)?.message ?? ''}`)

      return reply(500, { error: 'cleanup_failed' })
    }
  }

  let deleted = 0
  let more = false
  try {
    for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
      const paths = await deps.listOrphans(BATCH_SIZE)
      if (paths.length === 0) break

      const removed = await deps.removePhotos(paths)
      deleted += removed

      // Una tanda llena puede dejar más detrás; si fue la última del día, quedan para mañana. Si Storage no
      // borró ninguna, pedir otra tanda traería las mismas: se para aquí.
      more = paths.length === BATCH_SIZE
      if (!more || removed === 0) break
    }
  } catch (reason) {
    console.error(`cleanup-photos: falló tras borrar ${deleted} fotos. ${(reason as Error)?.message ?? ''}`)

    return reply(500, { error: 'cleanup_failed', deleted })
  }

  console.log(`cleanup-photos: borradas ${deleted} fotos${more ? '; quedan más para la próxima ejecución' : ''}.`)

  return reply(200, { deleted, more })
}

/** Un depósito de fotos que se limpia: cómo saber qué sobra en él y cómo borrarlo. */
export interface PhotoBucket {
  /** El nombre del depósito en Storage, p. ej. `property-photos`. */
  bucket: string
  listOrphans: CleanupDependencies['listOrphans']
  countOrphans: CleanupDependencies['countOrphans']
  removePhotos: CleanupDependencies['removePhotos']
}

/** Separa el depósito de la ruta: los nombres de depósito nunca llevan dos puntos. */
const SEPARATOR = ':'

/**
 * Junta varios depósitos en uno solo para `handleCleanup`: cada tanda se llena con lo que sobra en el primero
 * y, si cabe más, en los siguientes; cada ruta lleva delante su depósito, y al borrar se reparten de vuelta.
 */
export const combineBuckets = (
  buckets: PhotoBucket[],
): Pick<CleanupDependencies, 'listOrphans' | 'countOrphans' | 'removePhotos'> => ({
  listOrphans: async (limit) => {
    const found: string[] = []
    for (const { bucket, listOrphans } of buckets) {
      if (found.length >= limit) break
      const paths = await listOrphans(limit - found.length)
      found.push(...paths.map((path) => `${bucket}${SEPARATOR}${path}`))
    }

    return found
  },

  countOrphans: async () => {
    let total = 0
    for (const { countOrphans } of buckets) total += await countOrphans()

    return total
  },

  removePhotos: async (keys) => {
    let removed = 0
    for (const { bucket, removePhotos } of buckets) {
      const prefix = `${bucket}${SEPARATOR}`
      const paths = keys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length))
      if (paths.length > 0) removed += await removePhotos(paths)
    }

    return removed
  },
})
