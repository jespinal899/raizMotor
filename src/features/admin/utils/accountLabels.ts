import type { AdminAccount } from '@/features/admin/types/admin.types'

/** El nombre completo de una cuenta, o un aviso si no lo guardó. */
export const fullName = ({ firstName, lastName }: Pick<AdminAccount, 'firstName' | 'lastName'>) =>
  `${firstName} ${lastName}`.trim() || 'Sin nombre'
