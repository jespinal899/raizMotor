import { useState } from 'react'
import { BadgeCheck, BadgeX, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import TextField from '@/components/TextField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AdminListState from '@/features/admin/components/AdminListState'
import AdminPager from '@/features/admin/components/AdminPager'
import ModerationActionButton from '@/features/admin/components/ModerationActionButton'
import { useAdminList } from '@/features/admin/hooks/useAdminList'
import type { AdminAgency, AdminService } from '@/features/admin/types/admin.types'
import AgencyLogo from '@/features/agencies/components/AgencyLogo'
import { ADVERTISER_KINDS } from '@/features/properties/data/propertyOptions.data'
import { agencyPath } from '@/shared/constants/routes'
import { formatLongDate } from '@/shared/utils/format'
import { formatInternationalPhone } from '@/shared/utils/honduranPhone'

const FILTERS: { label: string; verified?: boolean }[] = [
  { label: 'Todas' },
  { label: 'Sin verificar', verified: false },
  { label: 'Verificadas', verified: true },
]

interface AdminAgenciesTableProps {
  service: AdminService
}

/**
 * Los perfiles de las inmobiliarias, para revisarlos y marcarlos como verificados. La marca se pierde sola si
 * la inmobiliaria cambia de nombre: hay que volver a revisarla.
 */
const AdminAgenciesTable = ({ service }: AdminAgenciesTableProps) => {
  const [verified, setVerified] = useState<boolean>()
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')
  const list = useAdminList(
    (page) => service.listAgencies({ verified, search }, page),
    `agencies:${verified ?? 'all'}:${search}`,
  )

  const renderAction = ({ ownerId, name, verified: isVerified }: AdminAgency) =>
    isVerified ? (
      <ModerationActionButton
        label="Quitar verificación"
        icon={BadgeX}
        variant="destructive"
        title="¿Quitar la verificación?"
        description={`«${name}» deja de mostrar la marca de verificada en su página, sus anuncios y sus proyectos.`}
        busyLabel="Quitando…"
        onConfirm={(note) => service.setAgencyVerified(ownerId, false, note)}
        onDone={list.reload}
      />
    ) : (
      <ModerationActionButton
        label="Verificar"
        icon={BadgeCheck}
        title="¿Verificar esta inmobiliaria?"
        description={`«${name}» muestra la marca de verificada. Hazlo solo después de revisar que la empresa existe y que la cuenta es suya (RTN, sitio web o una llamada).`}
        busyLabel="Verificando…"
        onConfirm={(note) => service.setAgencyVerified(ownerId, true, note)}
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
        <TextField label="Buscar por nombre" type="search" enterKeyHint="search" value={typed} onChange={setTyped} className="w-72 max-w-full" />
        <Button type="submit" size="lg" className="h-11">
          <Search />
          Buscar
        </Button>
      </form>

      <div role="group" aria-label="Verificación de las inmobiliarias" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            type="button"
            variant={filter.verified === verified ? 'default' : 'outline'}
            aria-pressed={filter.verified === verified}
            onClick={() => setVerified(filter.verified)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <AdminListState
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        empty="No hay inmobiliarias que cumplan la búsqueda."
      >
        <ul className="grid gap-4">
          {list.items.map((agency) => (
            <li key={agency.ownerId} className="flex flex-wrap items-start gap-4 rounded-2xl border p-4">
              <AgencyLogo agency={agency} alt="" className="size-14 text-sm" />
              <div className="grid min-w-0 flex-1 gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to={agencyPath(agency.slug)} className="font-medium text-primary underline-offset-4 hover:underline">
                    {agency.name}
                  </Link>
                  <Badge variant={agency.verified ? 'default' : 'outline'}>{agency.verified ? 'Verificada' : 'Sin verificar'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ADVERTISER_KINDS[agency.kind]}
                  {agency.city && ` · ${agency.city}`} · desde el {formatLongDate(agency.createdAt.slice(0, 10))}
                </p>
                <p className="text-sm break-words">
                  {[agency.phone && formatInternationalPhone(agency.phone), agency.email, agency.website]
                    .filter(Boolean)
                    .join(' · ') || 'Sin datos de contacto'}
                </p>
                <div>{renderAction(agency)}</div>
              </div>
            </li>
          ))}
        </ul>
      </AdminListState>

      <AdminPager page={list.page} totalPages={list.totalPages} total={list.total} noun="inmobiliarias" onChange={list.goTo} />
    </div>
  )
}

export default AdminAgenciesTable
