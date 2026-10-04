import { SearchX } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import PropertyCollection from '@/features/properties/components/PropertyCollection'
import type { Property } from '@/features/properties/types/property.types'
import { formatResultsSummary } from '@/features/search/utils/resultsSummary'
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
  /** Propiedades de la página que se está viendo. */
  properties: Property[]
  /** Total de propiedades que cumplen los filtros, sumando todas las páginas. */
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  error?: Error
}

const SearchResults = ({ properties, total, page, pageSize, isLoading, error }: SearchResultsProps) => {
  const hasResults = !isLoading && !error && properties.length > 0

  return (
    <div className="grid gap-6">
      {hasResults && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {formatResultsSummary({ total, page, pageSize, count: properties.length })}
        </p>
      )}
      <PropertyCollection
        properties={properties}
        isLoading={isLoading}
        error={error}
        skeletonCount={pageSize}
        emptyState={<NoResults />}
      />
    </div>
  )
}

export default SearchResults
