import Container from '@/components/layout/Container'
import FeaturedProperties from '@/features/home/components/FeaturedProperties'
import HeroCarousel from '@/features/home/components/HeroCarousel'
import HowItWorks from '@/features/home/components/HowItWorks'
import SearchBar from '@/features/search/components/SearchBar'

const HomePage = () => {
  return (
    <>
      <HeroCarousel />
      <div className="border-b bg-muted/40">
        <Container className="py-6">
          <SearchBar />
        </Container>
      </div>
      <FeaturedProperties />
      <HowItWorks />
    </>
  )
}

export default HomePage
