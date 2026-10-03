import { ArrowRight } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PropertyCollection from '@/features/properties/components/PropertyCollection'
import { useFeaturedProperties } from '@/features/properties/hooks/useFeaturedProperties'
import { ROUTES } from '@/shared/constants/routes'

const FEATURED_COUNT = 6

const FeaturedProperties = () => {
  const { properties, isLoading, error } = useFeaturedProperties()

  return (
    <section aria-labelledby="propiedades-destacadas" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1.5">
          <h2
            id="propiedades-destacadas"
            className="font-heading text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Propiedades destacadas
          </h2>
          <p className="text-muted-foreground">Una selección de casas, apartamentos y terrenos verificados.</p>
        </div>
        <ButtonLink to={ROUTES.properties} variant="outline" size="lg">
          Ver todas
          <ArrowRight />
        </ButtonLink>
      </div>

      <PropertyCollection
        properties={properties}
        isLoading={isLoading}
        error={error}
        skeletonCount={FEATURED_COUNT}
      />
    </section>
  )
}

export default FeaturedProperties
