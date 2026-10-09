/**
 * Con qué vuelve alguien desde un enlace de su correo: `recovery` trae una sesión para elegir otra
 * contraseña e `invalid`, el aviso de que el enlace caducó o ya se usó. Lo demás —el enlace de confirmar la
 * cuenta, una sección de la página o nada— no necesita ninguna página especial.
 */
export type AuthLink = 'recovery' | 'invalid' | 'none'

/** Lee lo que Supabase deja tras la almohadilla de la dirección al volver al sitio. */
export const readAuthLink = (hash: string): AuthLink => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))

  if (params.has('error')) return 'invalid'

  return params.get('type') === 'recovery' ? 'recovery' : 'none'
}
