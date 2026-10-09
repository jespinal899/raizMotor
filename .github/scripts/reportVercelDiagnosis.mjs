// Escribe el diagnóstico como aviso del trabajo: se lee en la página de la ejecución, sin abrir el registro.
import { diagnoseCredentials } from './vercelDiagnosis.mjs'

const { VERCEL_TOKEN: token, VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId } = process.env

const diagnosis = await diagnoseCredentials({ token, orgId, projectId }).catch(
  (error) => `No se pudo consultar a Vercel: ${error.message}`,
)

console.log(`::error title=Diagnóstico de Vercel::${diagnosis}`)
