import { describe, expect, it } from 'vitest'
import { DEPARTMENTS } from '@/features/properties/data/departments.data'

/** Todas las migraciones, en orden: una posterior puede añadir municipios. */
const MIGRATIONS = Object.entries(
  import.meta.glob<string>('../../../../supabase/migrations/*.sql', { query: '?raw', import: 'default', eager: true }),
)
  .toSorted(([first], [second]) => first.localeCompare(second))
  .map(([, sql]) => sql)

/** Las parejas (departamento, municipio) que las migraciones guardan en `public.municipalities`. */
const readMunicipalities = (migrations: string[]): string[] => {
  const inserts = migrations.flatMap((sql) => [
    ...sql.matchAll(/insert into public\.municipalities[^;]*?values([\s\S]*?)on conflict/g),
  ])
  if (inserts.length === 0) throw new Error('Ninguna migración guarda los municipios.')

  return inserts.flatMap(([, values]) =>
    [...values.matchAll(/\('((?:[^']|'')*)', '((?:[^']|'')*)'\)/g)].map(
      ([, department, name]) => `${department}|${name.replaceAll("''", "'")}`,
    ),
  )
}

describe('municipios de la base de datos', () => {
  it('son los mismos que ofrece el formulario: si no, el servidor rechazaría ciudades que el sitio deja elegir', () => {
    // Arrange
    const offered = DEPARTMENTS.flatMap(({ id, municipalities }) => municipalities.map((name) => `${id}|${name}`))

    // Act
    const stored = readMunicipalities(MIGRATIONS)

    // Assert
    expect(stored.toSorted()).toEqual(offered.toSorted())
  })
})
