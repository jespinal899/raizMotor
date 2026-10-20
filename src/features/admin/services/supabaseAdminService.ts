import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AdminAccount,
  AdminListing,
  AdminProject,
  AdminReport,
  AdminService,
} from '@/features/admin/types/admin.types'
import type { PageRequest, Paginated } from '@/shared/types/common.types'

/** Lo que responde Supabase cuando se pide un tramo que empieza después del último registro. */
const RANGE_NOT_SATISFIABLE = 'PGRST103'

interface SupabaseAnswer<Data> {
  data: Data | null
  count?: number | null
  error: { code?: string } | null
}

const toPage = <T>(items: T[], total: number, { page, pageSize }: PageRequest): Paginated<T> => ({
  items,
  total,
  page,
  pageSize,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
})

/** El tramo de filas de una página. Si la página ya no existe, ninguna: quien la pidió vuelve a la última. */
const readPage = async <Row, T>(
  answer: PromiseLike<SupabaseAnswer<Row[]>>,
  countOnly: () => PromiseLike<SupabaseAnswer<unknown>>,
  toItem: (row: Row) => T,
  page: PageRequest,
): Promise<Paginated<T>> => {
  const { data, count, error } = await answer

  if (error?.code === RANGE_NOT_SATISFIABLE) {
    const counted = await countOnly()
    if (counted.error) throw counted.error

    return toPage([], counted.count ?? 0, page)
  }
  if (error) throw error

  return toPage((data ?? []).map(toItem), count ?? 0, page)
}

const rangeOf = ({ page, pageSize }: PageRequest): [number, number] => [(page - 1) * pageSize, page * pageSize - 1]

/** Sin los comodines de la búsqueda por patrones: escritos a propósito, encontrarían cualquier cosa. */
const toPattern = (search: string) => `%${search.trim().replace(/[%_*\\]/g, '')}%`

interface ReportRow {
  id: string
  reason: AdminReport['reason']
  details: string
  status: AdminReport['status']
  created_at: string
  /**
   * Un reporte es de un solo anuncio, y Supabase lo entrega como objeto. Sin los tipos de la base generados,
   * la librería lo declara como lista: se aceptan las dos formas.
   */
  property: AdminReport['property'] | NonNullable<AdminReport['property']>[]
  /** Igual que `property`, para los reportes de proyectos. */
  project: AdminReport['project'] | NonNullable<AdminReport['project']>[]
}

interface ProjectAdminRow {
  id: string
  name: string
  status: AdminProject['status']
  developer_name: string
  developer_phone: string
  city: string
  price_from: number
  created_at: string
}

const PROJECT_COLUMNS = 'id, name, status, developer_name, developer_phone, city, price_from, created_at'

/** Supabase entrega la fila relacionada como objeto, o como lista sin los tipos de la base generados. */
const firstOf = <T>(related: T | T[] | null | undefined): T | null => (Array.isArray(related) ? related[0] : related) ?? null

interface ListingRow {
  id: string
  title: string
  status: AdminListing['status']
  advertiser_name: string
  advertiser_phone: string
  city: string
  price: number
  operation: AdminListing['operation']
  created_at: string
}

interface AccountRow {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  max_publications: number
  max_projects: number
  role: AdminAccount['role']
  created_at: string
  published_count: number
  project_count: number
  total_count: number
}

const LISTING_COLUMNS = 'id, title, status, advertiser_name, advertiser_phone, city, price, operation, created_at'

/**
 * El panel de administración con Supabase. Leer los reportes y los anuncios lo permiten las políticas de la
 * base solo al equipo; cambiar algo pasa por funciones que comprueban primero el papel de quien llama.
 */
export const createSupabaseAdminService = (client: SupabaseClient): AdminService => {
  const call = async (fn: string, args: Record<string, unknown>) => {
    const { error } = await client.rpc(fn, args)
    if (error) throw error
  }

  return {
    isAdmin: async () => {
      const { data: session } = await client.auth.getSession()
      if (!session.session) return false

      const { data, error } = await client.rpc('is_admin')
      if (error) throw error

      return data === true
    },

    listReports: (status, page) => {
      const reports = (head = false) =>
        client
          .from('property_reports')
          .select('id, reason, details, status, created_at, property:properties(id, title, status), project:projects(id, name, status)', {
            count: 'exact',
            head,
          })
          .eq('status', status)

      return readPage<ReportRow, AdminReport>(
        reports()
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(...rangeOf(page)),
        () => reports(true),
        (row) => ({
          id: row.id,
          reason: row.reason,
          details: row.details,
          status: row.status,
          createdAt: row.created_at,
          property: firstOf(row.property),
          project: firstOf(row.project),
        }),
        page,
      )
    },

    reviewReport: (reportId, decision, note) =>
      call('admin_review_report', { target_report: reportId, decision, review_note: note }),

    listListings: ({ status, search }, page) => {
      const listings = (head = false) => {
        let query = client.from('properties').select(LISTING_COLUMNS, { count: 'exact', head })
        if (status) query = query.eq('status', status)
        if (search?.trim()) query = query.ilike('title', toPattern(search))

        return query
      }

      return readPage<ListingRow, AdminListing>(
        listings()
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(...rangeOf(page)),
        () => listings(true),
        (row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          advertiserName: row.advertiser_name,
          advertiserPhone: row.advertiser_phone,
          city: row.city,
          price: row.price,
          operation: row.operation,
          createdAt: row.created_at,
        }),
        page,
      )
    },

    setListingStatus: (propertyId, status, note) =>
      call('admin_set_property_status', { target_property: propertyId, new_status: status, review_note: note }),

    listProjects: ({ status, search }, page) => {
      const projects = (head = false) => {
        let query = client.from('projects').select(PROJECT_COLUMNS, { count: 'exact', head })
        if (status) query = query.eq('status', status)
        if (search?.trim()) query = query.ilike('name', toPattern(search))

        return query
      }

      return readPage<ProjectAdminRow, AdminProject>(
        projects()
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(...rangeOf(page)),
        () => projects(true),
        (row) => ({
          id: row.id,
          name: row.name,
          status: row.status,
          developerName: row.developer_name,
          developerPhone: row.developer_phone,
          city: row.city,
          priceFrom: row.price_from,
          createdAt: row.created_at,
        }),
        page,
      )
    },

    // La función la crea supabase/migrations/20261018000000_moderar_proyectos.sql.
    setProjectStatus: (projectId, status, note) =>
      call('admin_set_project_status', { target_project: projectId, new_status: status, review_note: note }),

    listAccounts: async (search, page) => {
      const [offset] = rangeOf(page)
      const { data, error } = await client.rpc('admin_list_accounts', {
        search: search.trim(),
        page_offset: offset,
        page_limit: page.pageSize,
      })
      if (error) throw error

      const rows = (data as AccountRow[] | null) ?? []
      const accounts = rows.map(
        (row): AdminAccount => ({
          id: row.id,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          phone: row.phone,
          maxPublications: row.max_publications,
          maxProjects: row.max_projects,
          role: row.role,
          publishedCount: Number(row.published_count),
          projectCount: Number(row.project_count),
          createdAt: row.created_at,
        }),
      )

      // Cada fila trae el total de cuentas que cumplen la búsqueda; una página vacía no lo sabe.
      return toPage(accounts, rows.length > 0 ? Number(rows[0].total_count) : 0, page)
    },

    // La función la crea supabase/migrations/20261017000000_proyectos_de_inmobiliarias.sql.
    setAccountLimits: (accountId, { publications, projects }, note) =>
      call('admin_set_account_limits', {
        target_account: accountId,
        new_publications: publications,
        new_projects: projects,
        review_note: note,
      }),
  }
}
