import { Link } from 'react-router-dom'
import { LOGO_PATHS } from '@/components/layout/logoPaths'
import { cn } from '@/lib/utils'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES } from '@/shared/constants/routes'

interface LogoProps {
  className?: string
  onClick?: () => void
}

const Logo = ({ className, onClick }: LogoProps) => {
  return (
    <Link
      to={ROUTES.home}
      onClick={onClick}
      aria-label={`${BRAND.name}, ir al inicio`}
      className={cn(
        'group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
          aria-hidden="true"
        >
          {LOGO_PATHS.map((path) => (
            <path key={path} d={path} />
          ))}
        </svg>
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight text-primary sm:text-xl">
        {BRAND.name}
      </span>
    </Link>
  )
}

export default Logo
