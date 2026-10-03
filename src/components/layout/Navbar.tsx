import { Plus } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import DesktopNav from '@/components/layout/DesktopNav'
import Logo from '@/components/layout/Logo'
import MobileNav from '@/components/layout/MobileNav'
import NavLabel from '@/components/layout/NavLabel'
import { NAV } from '@/components/layout/navigation'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <Logo />
        <DesktopNav className="hidden lg:flex" />

        <div className="ml-auto flex items-center gap-2">
          <ButtonLink
            to={NAV.login.to}
            markCurrent
            variant="ghost"
            size="lg"
            className="group/nav hidden px-3.5 lg:inline-flex"
          >
            <NavLabel>{NAV.login.label}</NavLabel>
          </ButtonLink>
          <ButtonLink to={NAV.publish.to} markCurrent size="lg" className="group/nav px-3.5">
            <Plus />
            <NavLabel>{NAV.publish.label}</NavLabel>
          </ButtonLink>
          <MobileNav className="lg:hidden" />
        </div>
      </div>
    </header>
  )
}

export default Navbar
