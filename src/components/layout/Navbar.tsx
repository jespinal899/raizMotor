import { Plus } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import Container from '@/components/layout/Container'
import DesktopNav from '@/components/layout/DesktopNav'
import Logo from '@/components/layout/Logo'
import MobileNav from '@/components/layout/MobileNav'
import NavLabel from '@/components/layout/NavLabel'
import { NAV } from '@/components/layout/navigation'
import AccountMenu from '@/features/auth/components/AccountMenu'
import { useAuth } from '@/features/auth/hooks/useAuth'

const Navbar = () => {
  const { status, user } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-3 lg:gap-8">
        <Logo />
        <DesktopNav className="hidden lg:flex" />

        <div className="ml-auto flex items-center gap-2">
          {/* Mientras no se sabe si hay sesión no se muestra ninguna de las dos: así no parpadea la que no es. */}
          {status === 'signedIn' && <AccountMenu user={user} className="hidden lg:inline-flex" />}
          {status === 'signedOut' && (
            <ButtonLink
              to={NAV.login.to}
              markCurrent
              variant="ghost"
              size="lg"
              className="group/nav hidden px-3.5 lg:inline-flex"
            >
              <NavLabel>{NAV.login.label}</NavLabel>
            </ButtonLink>
          )}
          <ButtonLink to={NAV.publish.to} markCurrent size="lg" className="group/nav px-3.5">
            <Plus />
            <NavLabel>{NAV.publish.label}</NavLabel>
          </ButtonLink>
          <MobileNav className="lg:hidden" />
        </div>
      </Container>
    </header>
  )
}

export default Navbar
