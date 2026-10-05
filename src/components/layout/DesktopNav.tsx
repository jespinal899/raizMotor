import { ArrowRight } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import NavLabel from '@/components/layout/NavLabel'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { NAV, PROPERTY_CATEGORIES } from '@/components/layout/navigation'
import { cn } from '@/lib/utils'

const itemStyle = cn(
  navigationMenuTriggerStyle(),
  'group/nav px-3 text-foreground/70 hover:text-foreground aria-[current=page]:text-primary',
)

interface DesktopNavProps {
  className?: string
}

const DesktopNav = ({ className }: DesktopNavProps) => {
  const { pathname } = useLocation()
  const inProperties = pathname.startsWith(NAV.properties.to)

  return (
    <NavigationMenu aria-label="Navegación principal" className={className}>
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink render={<NavLink to={NAV.home.to} end />} className={itemStyle}>
            <NavLabel>{NAV.home.label}</NavLabel>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={cn(itemStyle, inProperties && 'text-primary')}>
            <NavLabel active={inProperties}>{NAV.properties.label}</NavLabel>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-2">
            <ul className="grid w-80 gap-0.5">
              {PROPERTY_CATEGORIES.map(({ label, description, to, icon: Icon }) => (
                <li key={to}>
                  <NavigationMenuLink
                    render={<Link to={to} />}
                    active={pathname === to}
                    closeOnClick
                    className="gap-3 p-2.5"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="grid gap-1">
                      <span className="leading-none font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t pt-2">
              <NavigationMenuLink
                render={<Link to={NAV.properties.to} />}
                closeOnClick
                className="justify-between px-2.5 font-medium text-primary"
              >
                Ver todas las propiedades
                <ArrowRight />
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          {/* Es una sección de la portada, no una página: con `NavLink` se marcaría como actual en todo el inicio. */}
          <NavigationMenuLink render={<Link to={NAV.about.to} />} className={itemStyle}>
            <NavLabel>{NAV.about.label}</NavLabel>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink render={<NavLink to={NAV.contact.to} />} className={itemStyle}>
            <NavLabel>{NAV.contact.label}</NavLabel>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default DesktopNav
