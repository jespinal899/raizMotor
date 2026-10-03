import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Logo from '@/components/layout/Logo'
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
import { BRAND } from '@/shared/constants/brand'
import { NAV, PROPERTY_CATEGORIES } from '@/shared/constants/navigation'

const linkStyle =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-foreground/80 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary'

interface MobileNavProps {
  className?: string
}

const MobileNav = ({ className }: MobileNavProps) => {
  const [open, setOpen] = useState(false)
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
            {NAV.home.label}
          </NavLink>

          <NavLink to={NAV.properties.to} end onClick={close} className={linkStyle}>
            {NAV.properties.label}
          </NavLink>
          <ul className="ml-5 grid gap-1 border-l pl-2">
            {PROPERTY_CATEGORIES.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} onClick={close} className={linkStyle}>
                  <Icon className="size-4.5 text-primary" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <NavLink to={NAV.contact.to} onClick={close} className={linkStyle}>
            {NAV.contact.label}
          </NavLink>
        </nav>

        <SheetFooter className="border-t">
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link to={NAV.login.to} onClick={close} />}
          >
            {NAV.login.label}
          </Button>
          <Button size="lg" nativeButton={false} render={<Link to={NAV.publish.to} onClick={close} />}>
            <Plus />
            {NAV.publish.label}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
