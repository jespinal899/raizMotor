import { ArrowRight } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import Container from '@/components/layout/Container'
import PropertyCollection from '@/features/properties/components/PropertyCollection'
import { useFeaturedProperties } from '@/features/properties/hooks/useFeaturedProperties'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { ROUTES } from '@/shared/constants/routes'

const FEATURED_COUNT = 6

interface FeaturedPropertiesProps {
  service?: PropertyService
}

const FeaturedProperties = ({ service }: FeaturedPropertiesProps) => {
  const { properties, isLoading, error } = useFeaturedProperties(service)

  // Sin destacadas, la sección sobra: un título sobre un hueco parecería un fallo.
  if (!isLoading && !error && properties.length === 0) return null

  return (
    <Container as="section" aria-labelledby="propiedades-destacadas" className="py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1.5">
          <h2
            id="propiedades-destacadas"
            className="font-heading text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Propiedades destacadas
          </h2>
          <p className="text-muted-foreground">Una selección de casas, apartamentos y terrenos.</p>
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
    </Container>
  )
}

export default FeaturedProperties
