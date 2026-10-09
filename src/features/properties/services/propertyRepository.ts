import { createIndexedDbPublicationRepository } from '@/features/properties/services/publishedPropertyRepository'
import type { PublishedPropertyRepository } from '@/features/properties/services/publishedPropertyRepository'
import { createSupabasePropertyGateway } from '@/features/properties/services/supabasePropertyGateway'
import { createSupabasePropertyRepository } from '@/features/properties/services/supabasePropertyRepository'
import { resizePhoto } from '@/features/properties/utils/photoResize'
import { supabase } from '@/lib/supabaseClient'

/** Con Supabase configurado, los anuncios los ve cualquiera; sin él, solo quien los guardó en su navegador. */
export const ADS_SHARED = supabase !== null

// Único punto donde se elige dónde se guardan los anuncios.
export const propertyRepository: PublishedPropertyRepository = supabase
  ? createSupabasePropertyRepository({ gateway: createSupabasePropertyGateway(supabase), preparePhoto: resizePhoto })
  : createIndexedDbPublicationRepository()
