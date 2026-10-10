import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminListingsTable from '@/features/admin/components/AdminListingsTable'
import AdminReportsTable from '@/features/admin/components/AdminReportsTable'
import AdminUsersTable from '@/features/admin/components/AdminUsersTable'
import type { AdminService } from '@/features/admin/types/admin.types'

const SECTIONS = [
  { id: 'reportes', title: 'Reportes', Content: AdminReportsTable },
  { id: 'anuncios', title: 'Anuncios', Content: AdminListingsTable },
  { id: 'cuentas', title: 'Cuentas', Content: AdminUsersTable },
] as const

interface AdminDashboardProps {
  service: AdminService
}

/** Las tres pestañas del panel. Cada una lee su lista solo al abrirla. */
const AdminDashboard = ({ service }: AdminDashboardProps) => {
  return (
    <Tabs defaultValue={SECTIONS[0].id} className="gap-6">
      <TabsList variant="line" className="h-auto w-full justify-start gap-6 border-b p-0 group-data-horizontal/tabs:h-auto">
        {SECTIONS.map(({ id, title }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="h-auto flex-none rounded-none px-1 pt-1 pb-3 text-base after:bg-primary data-active:text-primary group-data-horizontal/tabs:after:-bottom-px"
          >
            {title}
          </TabsTrigger>
        ))}
      </TabsList>

      {SECTIONS.map(({ id, Content }) => (
        <TabsContent key={id} value={id}>
          <Content service={service} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default AdminDashboard
