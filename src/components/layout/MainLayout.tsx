import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'
import InstallAppBanner from '@/components/layout/InstallAppBanner'
import Navbar from '@/components/layout/Navbar'

interface MainLayoutProps {
  /** Para las pantallas que llevan el pie reducido al aviso de derechos. */
  compactFooter?: boolean
}

const MainLayout = ({ compactFooter = false }: MainLayoutProps) => {
  // Cada página se descarga al entrar en ella: mientras llega, la barra de arriba avisa de que algo pasa.
  const { state } = useNavigation()

  return (
    <div className="flex min-h-svh flex-col standalone:max-lg:pb-tabbar">
      {state === 'loading' && (
        <div
          role="progressbar"
          aria-label="Abriendo la página"
          className="fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-primary"
        />
      )}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer compact={compactFooter} />
      {/*
        En el navegador del teléfono el sitio se ve como una web e invita a instalarlo; instalado, se maneja
        como una aplicación, con las pestañas abajo.
      */}
      <InstallAppBanner className="lg:hidden" />
      <BottomNav className="hidden standalone:max-lg:block" />
      {/* Al cambiar de página sube al inicio (o a la sección del enlace) y al volver atrás recupera la posición. */}
      <ScrollRestoration />
    </div>
  )
}

export default MainLayout
