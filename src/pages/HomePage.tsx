import { CircleCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import StatusAlert from '@/components/StatusAlert'
import Container from '@/components/layout/Container'
import AboutUs from '@/features/home/components/AboutUs'
import FeaturedProjects from '@/features/home/components/FeaturedProjects'
import FeaturedProperties from '@/features/home/components/FeaturedProperties'
import HeroCarousel from '@/features/home/components/HeroCarousel'
import HowItWorks from '@/features/home/components/HowItWorks'
import SearchBar from '@/features/search/components/SearchBar'
import { isNotice } from '@/shared/constants/notices'

const HomePage = () => {
  const { state } = useLocation()

  return (
    <>
      {isNotice(state, 'passwordUpdated') && (
        <Container className="pt-6">
          <StatusAlert
            role="status"
            icon={CircleCheck}
            title="Tu contraseña se actualizó"
            description="Desde ahora entras con ella. Tu sesión ya está iniciada."
          />
        </Container>
      )}
      <HeroCarousel />
      <div className="border-b bg-muted/40">
        <Container className="py-6">
          <SearchBar />
        </Container>
      </div>
      <FeaturedProperties />
      <FeaturedProjects />
      <AboutUs />
      <HowItWorks />
    </>
  )
}

export default HomePage
