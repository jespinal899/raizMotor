import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import DesktopNav from '@/components/layout/DesktopNav'
import Logo from '@/components/layout/Logo'
import MobileNav from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { NAV } from '@/shared/constants/navigation'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 md:gap-8 lg:px-8">
        <Logo />
        <DesktopNav className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            nativeButton={false}
            render={<Link to={NAV.login.to} />}
            className="hidden px-3.5 md:inline-flex"
          >
            {NAV.login.label}
          </Button>
          <Button size="lg" nativeButton={false} render={<Link to={NAV.publish.to} />} className="px-3.5">
            <Plus />
            {NAV.publish.label}
          </Button>
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </header>
  )
}

export default Navbar
