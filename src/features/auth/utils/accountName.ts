import type { SessionUser } from '@/features/auth/types/auth.types'

/** Cómo llamar a la persona en poco espacio: por su nombre o, si la cuenta no lo guarda, por su correo. */
export const shortName = ({ firstName, email }: SessionUser) => firstName || email

/** Su nombre completo; el correo si la cuenta no guarda ninguno. */
export const fullName = ({ firstName, lastName, email }: SessionUser) =>
  [firstName, lastName].filter(Boolean).join(' ') || email
