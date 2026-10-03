import { Outlet, ScrollRestoration } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'

const MainLayout = () => {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Al cambiar de página sube al inicio (o a la sección del enlace) y al volver atrás recupera la posición. */}
      <ScrollRestoration />
    </div>
  )
}

export default MainLayout
