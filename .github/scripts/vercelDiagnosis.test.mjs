import { describe, expect, it, vi } from 'vitest'

import { DIAGNOSIS, diagnoseCredentials } from './vercelDiagnosis.mjs'

const TEAM_ID = 'team_dueno'
const CREDENTIALS = { token: 'token-secreto', orgId: TEAM_ID, projectId: 'prj_sitio' }
const AUTHORIZED = { headers: { Authorization: `Bearer ${CREDENTIALS.token}` } }
const PROJECT_URL = `https://api.vercel.com/v9/projects/${CREDENTIALS.projectId}`

const answer = (status, body = {}) => ({ ok: status < 400, status, json: async () => body })

/** Un Vercel de mentira: a la consulta de la cuenta y a la del proyecto responde lo que diga cada prueba. */
const vercelAnswering = ({
  account = answer(200, { user: { id: 'usuario' } }),
  project = answer(200, { accountId: TEAM_ID }),
} = {}) => vi.fn(async (url) => (new URL(url).pathname === '/v2/user' ? account : project))

describe('diagnoseCredentials', () => {
  it.each([
    ['el token, si Vercel lo rechaza', { account: answer(403) }, DIAGNOSIS.invalidToken],
    ['el proyecto, si Vercel no lo encuentra', { project: answer(404) }, DIAGNOSIS.projectNotFound],
    ['el dueño, si el proyecto es de otro equipo', { project: answer(200, { accountId: 'team_otro' }) }, DIAGNOSIS.wrongOwner],
    ['otra causa, si las tres credenciales corresponden al proyecto', {}, DIAGNOSIS.credentialsMatch],
  ])('señala %s', async (_case, answers, expected) => {
    // Arrange
    const request = vercelAnswering(answers)

    // Act
    const diagnosis = await diagnoseCredentials(CREDENTIALS, request)

    // Assert
    expect(diagnosis).toBe(expected)
  })

  it('busca el proyecto dentro del equipo cuando el dueño es un equipo', async () => {
    // Arrange
    const request = vercelAnswering()

    // Act
    await diagnoseCredentials(CREDENTIALS, request)

    // Assert
    expect(request).toHaveBeenCalledWith(`${PROJECT_URL}?teamId=${TEAM_ID}`, AUTHORIZED)
  })

  it('busca el proyecto sin equipo cuando el dueño no es un equipo, como hace Vercel al publicar', async () => {
    // Arrange
    const request = vercelAnswering()

    // Act
    await diagnoseCredentials({ ...CREDENTIALS, orgId: 'usuario' }, request)

    // Assert
    expect(request).toHaveBeenCalledWith(PROJECT_URL, AUTHORIZED)
  })

  it('señala el dueño cuando el proyecto aparece sin equipo pero es de un equipo', async () => {
    // Arrange
    const request = vercelAnswering()

    // Act
    const diagnosis = await diagnoseCredentials({ ...CREDENTIALS, orgId: 'usuario' }, request)

    // Assert
    expect(diagnosis).toBe(DIAGNOSIS.wrongOwner)
  })
})
