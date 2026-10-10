import { useState } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import TextField from '@/components/TextField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AdminListState from '@/features/admin/components/AdminListState'
import AdminPager from '@/features/admin/components/AdminPager'
import ModerationActionButton from '@/features/admin/components/ModerationActionButton'
import { LISTING_STATUS_LABELS } from '@/features/admin/data/adminLabels.data'
import { useAdminList } from '@/features/admin/hooks/useAdminList'
import type { AdminListing, AdminService, ListingStatus } from '@/features/admin/types/admin.types'
import { propertyDetailPath } from '@/shared/constants/routes'
import { formatLongDate, formatPrice } from '@/shared/utils/format'
import { formatInternationalPhone } from '@/shared/utils/honduranPhone'

const FILTERS: { label: string; status?: ListingStatus }[] = [
  { label: 'Todos' },
  { label: 'Publicados', status: 'published' },
  { label: 'Despublicados', status: 'unpublished' },
  { label: 'Ocultos', status: 'hidden' },
]

interface AdminListingsTableProps {
  service: AdminService
}

/** Todos los anuncios, también los que no están en el catálogo, con la opción de ocultarlos o devolverlos. */
const AdminListingsTable = ({ service }: AdminListingsTableProps) => {
  const [status, setStatus] = useState<ListingStatus>()
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')
  const list = useAdminList(
    (page) => service.listListings({ status, search }, page),
    `listings:${status ?? 'all'}:${search}`,
  )

  const renderAction = ({ id, title, status: current }: AdminListing) =>
    current === 'hidden' ? (
      <ModerationActionButton
        label="Devolver al catálogo"
        icon={Eye}
        title="¿Devolver este anuncio al catálogo?"
        description={`«${title}» vuelve a verse en el catálogo, aunque su dueño ya no tenga lugar en su plan.`}
        busyLabel="Devolviendo…"
        onConfirm={(note) => service.setListingStatus(id, 'published', note)}
        onDone={list.reload}
      />
    ) : (
      <ModerationActionButton
        label="Ocultar"
        icon={EyeOff}
        variant="destructive"
        title="¿Ocultar este anuncio?"
        description={`«${title}» sale del catálogo y su dueño no podrá volver a publicarlo hasta que el equipo lo devuelva.`}
        busyLabel="Ocultando…"
        onConfirm={(note) => service.setListingStatus(id, 'hidden', note)}
        onDone={list.reload}
      />
    )

  return (
    <div className="grid gap-5">
      <form
        role="search"
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(typed.trim())
        }}
      >
        <TextField label="Buscar por título" type="search" value={typed} onChange={setTyped} className="w-72 max-w-full" />
        <Button type="submit" size="lg" className="h-11">
          <Search />
          Buscar
        </Button>
      </form>

      <div role="group" aria-label="Estado de los anuncios" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            type="button"
            variant={filter.status === status ? 'default' : 'outline'}
            aria-pressed={filter.status === status}
            onClick={() => setStatus(filter.status)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <AdminListState
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        empty="No hay anuncios que cumplan la búsqueda."
      >
        <ul className="grid gap-4">
          {list.items.map((listing) => (
            <li key={listing.id} className="grid gap-2 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={propertyDetailPath(listing.id)}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {listing.title}
                </Link>
                <Badge variant={listing.status === 'hidden' ? 'destructive' : 'outline'}>
                  {LISTING_STATUS_LABELS[listing.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatPrice(listing.price)}
                {listing.operation === 'alquiler' && ' al mes'} · {listing.city} · publicado el{' '}
                {formatLongDate(listing.createdAt.slice(0, 10))}
              </p>
              <p className="text-sm">
                {listing.advertiserName || 'Sin nombre'}
                {listing.advertiserPhone && ` · ${formatInternationalPhone(listing.advertiserPhone)}`}
              </p>
              <div>{renderAction(listing)}</div>
            </li>
          ))}
        </ul>
      </AdminListState>

      <AdminPager page={list.page} totalPages={list.totalPages} total={list.total} noun="anuncios" onChange={list.goTo} />
    </div>
  )
}

export default AdminListingsTable
