import { Link } from 'react-router-dom'
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
          <path d="M2.75 10.25 12 2.75l9.25 7.5" />
          <path d="M5.75 8.5v6h12.5v-6" />
          <path d="M12 14.5v7" />
          <path d="M12 16.75c-1 2.1-2.9 3.4-5.5 3.75" />
          <path d="M12 16.75c1 2.1 2.9 3.4 5.5 3.75" />
        </svg>
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight text-primary sm:text-xl">
        {BRAND.name}
      </span>
    </Link>
  )
}

export default Logo
