import FeaturedProperties from '@/features/home/components/FeaturedProperties'
import HeroCarousel from '@/features/home/components/HeroCarousel'
import HowItWorks from '@/features/home/components/HowItWorks'
import SearchBar from '@/features/search/components/SearchBar'

const HomePage = () => {
  return (
    <>
      <HeroCarousel />
      <div className="border-b bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SearchBar />
        </div>
      </div>
      <FeaturedProperties />
      <HowItWorks />
    </>
  )
}

export default HomePage
