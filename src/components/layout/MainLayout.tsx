import { Outlet, ScrollRestoration } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'

interface MainLayoutProps {
  /** Para las pantallas que llevan el pie reducido al aviso de derechos. */
  compactFooter?: boolean
}

const MainLayout = ({ compactFooter = false }: MainLayoutProps) => {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer compact={compactFooter} />
      {/* Al cambiar de página sube al inicio (o a la sección del enlace) y al volver atrás recupera la posición. */}
      <ScrollRestoration />
    </div>
  )
}

export default MainLayout
