import { useState } from 'react'
import { Search } from 'lucide-react'
import TextField from '@/components/TextField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AccountLimitAction from '@/features/admin/components/AccountLimitAction'
import AdminListState from '@/features/admin/components/AdminListState'
import AdminPager from '@/features/admin/components/AdminPager'
import { useAdminList } from '@/features/admin/hooks/useAdminList'
import type { AdminService } from '@/features/admin/types/admin.types'
import { fullName } from '@/features/admin/utils/accountLabels'
import { formatLongDate } from '@/shared/utils/format'
import { formatInternationalPhone } from '@/shared/utils/honduranPhone'

interface AdminUsersTableProps {
  service: AdminService
}

/** Las cuentas, con cuántos anuncios tienen publicados y cuántos admite su plan. */
const AdminUsersTable = ({ service }: AdminUsersTableProps) => {
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')
  const list = useAdminList((page) => service.listAccounts(search, page), `accounts:${search}`)

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
        <TextField
          label="Buscar por correo o nombre"
          type="search"
          value={typed}
          onChange={setTyped}
          className="w-72 max-w-full"
        />
        <Button type="submit" size="lg" className="h-11">
          <Search />
          Buscar
        </Button>
      </form>

      <AdminListState
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        empty="No hay cuentas que cumplan la búsqueda."
      >
        <ul className="grid gap-4">
          {list.items.map((account) => (
            <li key={account.id} className="grid gap-2 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{fullName(account)}</p>
                {account.role === 'admin' && <Badge>Equipo</Badge>}
              </div>
              <p className="text-sm break-all">{account.email}</p>
              <p className="text-sm text-muted-foreground">
                {account.phone ? formatInternationalPhone(account.phone) : 'Sin teléfono'} · desde el{' '}
                {formatLongDate(account.createdAt.slice(0, 10))}
              </p>
              <p className="text-sm">
                <span className="font-medium">
                  {account.publishedCount} de {account.maxPublications}
                </span>{' '}
                anuncios publicados
              </p>
              <div>
                <AccountLimitAction account={account} service={service} onDone={list.reload} />
              </div>
            </li>
          ))}
        </ul>
      </AdminListState>

      <AdminPager page={list.page} totalPages={list.totalPages} total={list.total} noun="cuentas" onChange={list.goTo} />
    </div>
  )
}

export default AdminUsersTable
