// Antes de compilar para producción se comprueba que el sitio vaya a tener Supabase. Sin sus variables la
// compilación sale bien, pero el sitio funciona sin cuentas y guarda los anuncios solo en el navegador de
// quien publica: parecería que publicar funciona sin que nadie más vea nada.

/** Avisos fijos: nunca llevan ningún valor, porque quedan a la vista en la ejecución. */
export const PROBLEMS = {
  missingUrl:
    'Falta VITE_SUPABASE_URL en las variables de producción de Vercel (Settings > Environment Variables). Es la dirección del proyecto, p. ej. https://abcdefgh.supabase.co.',
  invalidUrl: 'VITE_SUPABASE_URL debe ser una dirección https completa, p. ej. https://abcdefgh.supabase.co.',
  missingKey:
    'Falta VITE_SUPABASE_PUBLISHABLE_KEY en las variables de producción de Vercel (Settings > Environment Variables). Es la clave «publishable» o la antigua «anon» del proyecto.',
  privilegedKey:
    'VITE_SUPABASE_PUBLISHABLE_KEY contiene una clave privilegiada («secret» o «service_role»). Todo lo que empieza por VITE_ viaja dentro del sitio: cámbiala por la clave «publishable» y revoca la otra en el panel de Supabase.',
}

/** Las variables de un archivo `.env`: `CLAVE=valor`, con o sin comillas. Las líneas con `#` se ignoran. */
export const parseEnvFile = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map(([, key, raw]) => [key, raw.replace(/^(['"])(.*)\1$/, '$2')]),
  )

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/** Una clave antigua de Supabase es un JWT: su rol dice si es la pública («anon») o la privilegiada. */
const jwtRole = (value) => {
  const [, payload] = value.split('.')
  if (!payload) return undefined

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).role
  } catch {
    return undefined
  }
}

const isPrivilegedKey = (value) => value.startsWith('sb_secret_') || jwtRole(value) === 'service_role'

/** Lo que impide publicar con estas variables; vacío si están bien. */
export const findProblems = (env) => {
  const url = env.VITE_SUPABASE_URL?.trim() ?? ''
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''
  const problems = []

  if (!url) problems.push(PROBLEMS.missingUrl)
  else if (!isHttpsUrl(url)) problems.push(PROBLEMS.invalidUrl)

  if (!key) problems.push(PROBLEMS.missingKey)
  else if (isPrivilegedKey(key)) problems.push(PROBLEMS.privilegedKey)

  return problems
}
