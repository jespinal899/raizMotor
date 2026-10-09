import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PropertyCard from '@/features/properties/components/PropertyCard'
import type { Property } from '@/features/properties/types/property.types'

export interface PublicationGroup {
  /** Identifica la pestaña. */
  id: string
  title: string
  properties: Property[]
  /** Lo que se dice cuando no hay ninguna. */
  empty: string
}

interface PublicationTabsProps {
  /** Una pestaña por grupo, en este orden; la página se abre en la primera. */
  groups: [PublicationGroup, ...PublicationGroup[]]
  /** Los botones que acompañan a cada publicación. */
  renderActions: (property: Property) => ReactNode
}

/**
 * Las publicaciones propias repartidas en pestañas que van en una misma línea, cada una con cuántas tiene.
 * La pestaña abierta queda subrayada con el color de la marca y muestra las suyas como se ven en el
 * catálogo, con sus botones debajo; sin ninguna, lo dice.
 */
const PublicationTabs = ({ groups, renderActions }: PublicationTabsProps) => {
  return (
    <Tabs defaultValue={groups[0].id} className="gap-6">
      <TabsList variant="line" className="h-auto w-full justify-start gap-6 border-b p-0 group-data-horizontal/tabs:h-auto">
        {groups.map(({ id, title, properties }) => (
          <TabsTrigger
            key={id}
            value={id}
            // El subrayado de la pestaña abierta cae justo sobre la línea que recorre toda la fila.
            className="h-auto flex-none rounded-none px-1 pt-1 pb-3 text-base after:bg-primary data-active:text-primary group-data-horizontal/tabs:after:-bottom-px"
          >
            {title} <span className="font-normal text-muted-foreground">({properties.length})</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {groups.map(({ id, properties, empty }) => (
        <TabsContent key={id} value={id}>
          {properties.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">{empty}</p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <li key={property.id} className="grid content-start gap-3">
                  <PropertyCard property={property} />
                  {renderActions(property)}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default PublicationTabs
