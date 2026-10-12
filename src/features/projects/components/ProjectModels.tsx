import type { ProjectModel } from '@/features/projects/types/project.types'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import { formatArea, formatPrice } from '@/shared/utils/format'

const orDash = (value: number | undefined) => (value === undefined ? '—' : String(value))

/** Los modelos de unidad que ofrece el proyecto, del más barato al más caro. */
const ProjectModels = ({ models }: { models: ProjectModel[] }) => (
  <PropertyDetailSection id="modelos-del-proyecto" title="Modelos disponibles">
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Modelo</th>
            <th scope="col" className="px-4 py-3 font-medium">Habitaciones</th>
            <th scope="col" className="px-4 py-3 font-medium">Baños</th>
            <th scope="col" className="px-4 py-3 font-medium">Área</th>
            <th scope="col" className="px-4 py-3 font-medium">Desde</th>
          </tr>
        </thead>
        <tbody>
          {models.map(({ name, bedrooms, bathrooms, area, priceFrom }) => (
            <tr key={name} className="border-t">
              <th scope="row" className="px-4 py-3 font-medium">{name}</th>
              <td className="px-4 py-3">{orDash(bedrooms)}</td>
              <td className="px-4 py-3">{orDash(bathrooms)}</td>
              <td className="px-4 py-3">{formatArea(area)}</td>
              <td className="px-4 py-3 font-medium text-primary">{formatPrice(priceFrom)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </PropertyDetailSection>
)

export default ProjectModels
