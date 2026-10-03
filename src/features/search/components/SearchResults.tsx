import { SearchX } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import PropertyCollection from '@/features/properties/components/PropertyCollection'
import type { Property } from '@/features/properties/types/property.types'
import { ROUTES } from '@/shared/constants/routes'

const NoResults = () => (
  <EmptyState
    icon={SearchX}
    title="No encontramos propiedades con esos filtros"
    description="Prueba con otra ubicación, amplía el precio máximo o revisa todas las propiedades disponibles."
  >
    <ButtonLink to={ROUTES.properties} variant="outline">
      Ver todas las propiedades
    </ButtonLink>
  </EmptyState>
)

interface SearchResultsProps {
  properties: Property[]
  isLoading: boolean
  error?: Error
}

const SearchResults = ({ properties, isLoading, error }: SearchResultsProps) => {
  const hasResults = !isLoading && !error && properties.length > 0

  return (
    <div className="grid gap-6">
      {hasResults && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
        </p>
      )}
      <PropertyCollection
        properties={properties}
        isLoading={isLoading}
        error={error}
        emptyState={<NoResults />}
      />
    </div>
  )
}

export default SearchResults
