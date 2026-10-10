import { useState } from 'react'
import { Check, EyeOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AdminListState from '@/features/admin/components/AdminListState'
import AdminPager from '@/features/admin/components/AdminPager'
import ModerationActionButton from '@/features/admin/components/ModerationActionButton'
import { LISTING_STATUS_LABELS, REPORT_STATUS_LABELS } from '@/features/admin/data/adminLabels.data'
import { useAdminList } from '@/features/admin/hooks/useAdminList'
import type { AdminReport, AdminService, ReportStatus } from '@/features/admin/types/admin.types'
import { REPORT_REASONS } from '@/features/properties/data/reportReasons.data'
import { propertyDetailPath } from '@/shared/constants/routes'
import { formatLongDate } from '@/shared/utils/format'

const STATUSES = Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]

interface AdminReportsTableProps {
  service: AdminService
}

/** Los reportes de anuncios, de los pendientes a los ya revisados, con lo que se puede decidir sobre cada uno. */
const AdminReportsTable = ({ service }: AdminReportsTableProps) => {
  const [status, setStatus] = useState<ReportStatus>('open')
  const list = useAdminList((page) => service.listReports(status, page), `reports:${status}`)

  const renderActions = ({ id, property }: AdminReport) => (
    <div className="flex flex-wrap gap-2">
      {property && property.status !== 'hidden' && (
        <ModerationActionButton
          label="Ocultar anuncio"
          icon={EyeOff}
          variant="destructive"
          title="¿Ocultar este anuncio?"
          description={`«${property.title}» sale del catálogo y su dueño no podrá volver a publicarlo. Todos sus reportes pendientes quedan resueltos.`}
          busyLabel="Ocultando…"
          onConfirm={(note) => service.reviewReport(id, 'hide_property', note)}
          onDone={list.reload}
        />
      )}
      <ModerationActionButton
        label="Marcar como resuelto"
        icon={Check}
        title="¿Marcar el reporte como resuelto?"
        description="Se tomó una medida fuera del panel, p. ej. hablar con quien publica. El anuncio no cambia."
        busyLabel="Guardando…"
        onConfirm={(note) => service.reviewReport(id, 'resolve', note)}
        onDone={list.reload}
      />
      <ModerationActionButton
        label="Descartar"
        icon={X}
        title="¿Descartar el reporte?"
        description="El reporte se revisó y no hacía falta ninguna medida. El anuncio no cambia."
        busyLabel="Descartando…"
        onConfirm={(note) => service.reviewReport(id, 'dismiss', note)}
        onDone={list.reload}
      />
    </div>
  )

  return (
    <div className="grid gap-5">
      <div role="group" aria-label="Estado de los reportes" className="flex flex-wrap gap-2">
        {STATUSES.map((option) => (
          <Button
            key={option}
            type="button"
            variant={option === status ? 'default' : 'outline'}
            aria-pressed={option === status}
            onClick={() => setStatus(option)}
          >
            {REPORT_STATUS_LABELS[option]}
          </Button>
        ))}
      </div>

      <AdminListState
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        empty={status === 'open' ? 'No hay reportes pendientes.' : 'No hay reportes en este estado.'}
      >
        <ul className="grid gap-4">
          {list.items.map((report) => (
            <li key={report.id} className="grid gap-3 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{REPORT_REASONS[report.reason]}</p>
                <p className="text-sm text-muted-foreground">{formatLongDate(report.createdAt.slice(0, 10))}</p>
              </div>
              {report.details && <p className="text-sm whitespace-pre-line">{report.details}</p>}
              {report.property ? (
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <Link to={propertyDetailPath(report.property.id)} className="font-medium text-primary underline-offset-4 hover:underline">
                    {report.property.title}
                  </Link>
                  <Badge variant="outline">{LISTING_STATUS_LABELS[report.property.status]}</Badge>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">El anuncio ya no existe.</p>
              )}
              {report.status === 'open' && renderActions(report)}
            </li>
          ))}
        </ul>
      </AdminListState>

      <AdminPager page={list.page} totalPages={list.totalPages} total={list.total} noun="reportes" onChange={list.goTo} />
    </div>
  )
}

export default AdminReportsTable
