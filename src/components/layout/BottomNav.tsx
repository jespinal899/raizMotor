import { Building2, House, Plus, Search, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NAV } from '@/components/layout/navigation'
import type { NavItem } from '@/components/layout/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/shared/constants/routes'

interface Tab extends NavItem {
  icon: LucideIcon
  /** Solo cuenta como actual en su dirección exacta, no en las que cuelgan de ella. */
  end?: boolean
}

interface BottomNavProps {
  className?: string
}

/**
 * Las pestañas fijas abajo, como en las aplicaciones del teléfono: lo principal queda al alcance del pulgar.
 * Solo salen en el sitio instalado (`MainLayout`); en el navegador, el menú de arriba hace su papel.
 * Se aparta de la barra de gestos del iPhone y de Android (`pb-safe`).
 */
const BottomNav = ({ className }: BottomNavProps) => {
  const { status } = useAuth()

  const tabs: Tab[] = [
    { ...NAV.home, icon: House, end: true },
    { ...NAV.properties, label: 'Buscar', icon: Search },
    { ...NAV.publish, icon: Plus },
    { ...NAV.projects, icon: Building2 },
    // Sin sesión, la pestaña abre el acceso; con ella, la cuenta. Mientras carga, la cuenta pide entrar si hace falta.
    { label: 'Cuenta', to: status === 'signedOut' ? ROUTES.login : ROUTES.account, icon: UserRound },
  ]

  return (
    <nav
      aria-label="Pestañas de la aplicación"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-safe backdrop-blur-md select-none',
        className,
      )}
    >
      <ul className="mx-auto grid h-tabbar max-w-lg grid-cols-5">
        {tabs.map(({ label, to, icon: Icon, end }) => {
          const isPublish = to === NAV.publish.to

          return (
            <li key={label} className="flex">
              <NavLink
                to={to}
                end={end}
                className="group/tab flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground outline-none transition-colors focus-visible:bg-muted active:bg-muted/60 aria-[current=page]:text-primary"
              >
                <span
                  className={cn(
                    'grid h-7 w-12 place-items-center rounded-full transition group-active/tab:scale-90',
                    isPublish
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'group-aria-[current=page]/tab:bg-primary/10',
                  )}
                >
                  <Icon className="size-5" strokeWidth={isPublish ? 2.5 : 2} />
                </span>
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
