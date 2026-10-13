import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/shared/constants/routes'

const LINKS = [
  { label: 'Propiedades', to: ROUTES.myProperties },
  { label: 'Proyectos', to: ROUTES.myProjects },
]

/** Las dos partes de «Mis publicaciones»: las propiedades y los proyectos de la cuenta. */
const MyPublicationsNav = () => (
  <nav aria-label="Mis publicaciones" className="flex gap-1 border-b">
    {LINKS.map(({ label, to }) => (
      <NavLink
        key={to}
        to={to}
        end
        className={({ isActive }) =>
          cn(
            '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
)

export default MyPublicationsNav
