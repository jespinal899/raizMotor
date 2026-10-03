import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import Container from '@/components/layout/Container'
import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import { useProperties } from '@/features/properties/hooks/useProperties'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import SearchBar from '@/features/search/components/SearchBar'
import SearchResults from '@/features/search/components/SearchResults'
import { parseSearchFilters } from '@/features/search/utils/buildSearchQuery'
import { usePageTitle } from '@/hooks/usePageTitle'

const buildHeading = ({ type, operation }: PropertyFilters) => {
  const subject = type ? PROPERTY_TYPES[type].plural : 'Propiedades'
  return operation ? `${subject} en ${OPERATIONS[operation].label.toLowerCase()}` : subject
}

const SearchPage = () => {
  const { tipo } = useParams()
  const [searchParams] = useSearchParams()
  const { pathname, search } = useLocation()

  const filters = parseSearchFilters(tipo, searchParams)
  const heading = buildHeading(filters)
  const { properties, isLoading, error } = useProperties(filters)

  usePageTitle(heading)

  return (
    <Container className="grid gap-8 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">{heading}</h1>
      {/* La clave reinicia el formulario cuando la URL cambia desde fuera (menú, botón atrás). */}
      <SearchBar key={pathname + search} initialFilters={filters} className="shadow-sm" />
      <SearchResults properties={properties} isLoading={isLoading} error={error} />
    </Container>
  )
}

export default SearchPage
