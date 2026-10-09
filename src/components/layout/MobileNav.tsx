import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import Logo from '@/components/layout/Logo'
import NavLabel from '@/components/layout/NavLabel'
import { NAV, PROPERTY_CATEGORIES } from '@/components/layout/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import AccountPanel from '@/features/auth/components/AccountPanel'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { BRAND } from '@/shared/constants/brand'

const linkStyle =
  'group/nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-foreground/80 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-primary'

interface MobileNavProps {
  className?: string
}

const MobileNav = ({ className }: MobileNavProps) => {
  const [open, setOpen] = useState(false)
  const { status, user } = useAuth()
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" aria-label="Abrir menú" className={className} />}
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="gap-0 data-[side=right]:w-full data-[side=right]:max-w-xs">
        <SheetHeader className="border-b">
          <SheetTitle className="sr-only">Menú de {BRAND.name}</SheetTitle>
          <SheetDescription className="sr-only">Navegación principal del sitio</SheetDescription>
          <Logo onClick={close} className="self-start" />
        </SheetHeader>

        <nav aria-label="Navegación móvil" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <NavLink to={NAV.home.to} end onClick={close} className={linkStyle}>
            <NavLabel>{NAV.home.label}</NavLabel>
          </NavLink>

          <NavLink to={NAV.properties.to} end onClick={close} className={linkStyle}>
            <NavLabel>{NAV.properties.label}</NavLabel>
          </NavLink>
          <ul className="ml-5 grid gap-1 border-l pl-2">
            {PROPERTY_CATEGORIES.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} onClick={close} className={linkStyle}>
                  <Icon className="size-4.5 text-primary" />
                  <NavLabel>{label}</NavLabel>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Es una sección de la portada, no una página: por eso no usa `NavLink`. */}
          <Link to={NAV.about.to} onClick={close} className={linkStyle}>
            <NavLabel>{NAV.about.label}</NavLabel>
          </Link>

          <NavLink to={NAV.contact.to} onClick={close} className={linkStyle}>
            <NavLabel>{NAV.contact.label}</NavLabel>
          </NavLink>
        </nav>

        <SheetFooter className="border-t">
          {status === 'signedIn' && <AccountPanel user={user} onNavigate={close} />}
          {status === 'signedOut' && (
            <ButtonLink
              to={NAV.login.to}
              markCurrent
              onClick={close}
              variant="outline"
              size="lg"
              className="group/nav"
            >
              <NavLabel>{NAV.login.label}</NavLabel>
            </ButtonLink>
          )}
          <ButtonLink to={NAV.publish.to} markCurrent onClick={close} size="lg" className="group/nav">
            <Plus />
            <NavLabel>{NAV.publish.label}</NavLabel>
          </ButtonLink>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
