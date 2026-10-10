// Detiene la publicación si las variables de producción que trajo `vercel pull` no sirven. Cada problema sale
// como aviso del trabajo, sin mostrar ningún valor.
import { readFileSync } from 'node:fs'
import { findProblems, parseEnvFile } from './productionEnv.mjs'

const ENV_FILE = '.vercel/.env.production.local'

let text = ''
try {
  text = readFileSync(ENV_FILE, 'utf8')
} catch {
  // Sin archivo no hay variables: cada una se avisa como falta.
}

const problems = findProblems(parseEnvFile(text))

for (const problem of problems) console.log(`::error title=No se publicó::${problem}`)

if (problems.length > 0) process.exit(1)
