interface SampleListingsEnv {
  VITE_SHOW_SAMPLE_LISTINGS?: string
}

/**
 * Si el catálogo muestra las propiedades de ejemplo. Son inventadas: con anuncios reales compartidos no se
 * mezclan con ellos salvo que la compilación lo pida, y sin servidor sirven para enseñar el sitio.
 */
export const showSampleListings = (adsShared: boolean, env: SampleListingsEnv): boolean =>
  !adsShared || env.VITE_SHOW_SAMPLE_LISTINGS?.trim() === 'true'
