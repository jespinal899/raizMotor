// Al publicar, la herramienta de Vercel responde «Project not found» tanto si falla el token como el proyecto
// o su dueño, y no dice cuál. Aquí se repiten sus consultas para saber qué secreto hay que corregir.
const API = 'https://api.vercel.com'
const TEAM_ID_PREFIX = 'team_'

/** Avisos fijos: no llevan ningún identificador ni el token, porque quedan a la vista en la ejecución. */
export const DIAGNOSIS = {
  invalidToken:
    'Vercel rechaza VERCEL_TOKEN: caducó o está mal copiado. Crea otro en vercel.com > Account Settings > Tokens y actualiza ese secreto.',
  projectNotFound:
    'Vercel no encuentra el proyecto de VERCEL_PROJECT_ID dentro de VERCEL_ORG_ID. Copia los dos otra vez: el «Project ID» está en Settings > General del proyecto y el «Team ID», en Settings > General de su equipo.',
  wrongOwner:
    'VERCEL_PROJECT_ID es correcto, pero VERCEL_ORG_ID no es el identificador del equipo dueño del proyecto. En vercel.com abre Settings > General del equipo, copia el «Team ID» (empieza por «team_») y actualiza ese secreto.',
  credentialsMatch:
    'Los tres secretos corresponden al proyecto, así que el motivo es otro: mira el registro del paso «Publicar».',
}

/** Lo que responde Vercel, o `null` si rechaza la consulta o no encuentra lo pedido. */
const ask = async (path, token, request) => {
  const response = await request(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } })

  return response.ok ? response.json() : null
}

/** El proyecto se busca dentro de un equipo solo si el dueño es un equipo: así lo hace la herramienta de Vercel. */
const projectPath = (projectId, orgId) => {
  const team = orgId.startsWith(TEAM_ID_PREFIX) ? `?teamId=${encodeURIComponent(orgId)}` : ''

  return `/v9/projects/${encodeURIComponent(projectId)}${team}`
}

/** Dice cuál de los secretos de Vercel no corresponde al proyecto. */
export const diagnoseCredentials = async ({ token, orgId, projectId }, request = fetch) => {
  const [account, project] = await Promise.all([
    ask('/v2/user', token, request),
    ask(projectPath(projectId, orgId), token, request),
  ])

  if (!account) return DIAGNOSIS.invalidToken
  if (!project) return DIAGNOSIS.projectNotFound

  return project.accountId === orgId ? DIAGNOSIS.credentialsMatch : DIAGNOSIS.wrongOwner
}
