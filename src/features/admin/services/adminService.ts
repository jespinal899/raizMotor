import { createSupabaseAdminService } from '@/features/admin/services/supabaseAdminService'
import type { AdminService } from '@/features/admin/types/admin.types'
import { supabase } from '@/lib/supabaseClient'

/** Sin Supabase no hay cuentas, así que nadie es del equipo y no hay nada que administrar. */
export const createPendingAdminService = (): AdminService => {
  const unavailable = async (): Promise<never> => {
    throw new Error('El panel de administración necesita Supabase.')
  }

  return {
    isAdmin: async () => false,
    listReports: unavailable,
    reviewReport: unavailable,
    listListings: unavailable,
    setListingStatus: unavailable,
    listAccounts: unavailable,
    setPublicationLimit: unavailable,
  }
}

// Único punto donde se elige el servicio del panel de administración.
export const adminService: AdminService = supabase ? createSupabaseAdminService(supabase) : createPendingAdminService()
