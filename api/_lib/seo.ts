// Lo que ven Google y las vistas previas de WhatsApp o Facebook. Esos programas leen el HTML tal como llega,
// sin ejecutar el sitio: por eso las funciones de Vercel (api/) completan aquí la cabecera de cada ficha, el
// mapa del sitio y el robots.txt. No dependen de Vercel ni del navegador: se prueban con Vitest (seo.test.ts).

const BRAND = 'DomusRaíz'
const LOCALE = 'es-HN'
const PHOTOS_BUCKET = 'property-photos'
const DESCRIPTION_LENGTH = 160
/** Lo que pide Supabase de una vez como mucho (Max Rows): el mapa del sitio lo lee por páginas. */
export const PAGE_SIZE = 100
/** Un mapa del sitio admite hasta 50.000 direcciones. */
const MAX_SITEMAP_URLS = 50_000

const TYPE_LABELS: Record<string, string> = { casa: 'Casa', apartamento: 'Apartamento', terreno: 'Terreno' }
const OPERATION_LABELS: Record<string, string> = { venta: 'en venta', alquiler: 'en alquiler' }

/** Las páginas públicas que no dependen de los anuncios. Las de cuenta, publicar o administrar no se indexan. */
export const STATIC_PATHS = ['/', '/propiedades', '/planes', '/planes/agente-inmobiliario', '/contacto', '/terminos', '/privacidad']

/** Las que nunca deben aparecer en un buscador: son de cada cuenta o pasos intermedios. */
const PRIVATE_PATHS = [
  '/publicar',
  '/mis-publicaciones',
  '/mi-cuenta',
  '/admin',
  '/iniciar-sesion',
  '/registro',
  '/recuperar-contrasena',
  '/restablecer-contrasena',
  '/planes/agente-inmobiliario/contratar/',
]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isPropertyId = (value: string | null): value is string => value !== null && UUID.test(value)

/** Un anuncio publicado, con lo que hace falta para presentarlo. */
export interface PropertyRow {
  id: string
  title: string
  description: string
  type: string
  operation: string
  price: number
  department: string
  city: string
  neighborhood: string
  photos: string[]
  bedrooms: number | null
  bathrooms: number | null
  built_area: number | null
  land_area: number | null
  updated_at: string
}

/** Las columnas que se piden de cada anuncio para su ficha. */
export const PROPERTY_COLUMNS =
  'id,title,description,type,operation,price,department,city,neighborhood,photos,bedrooms,bathrooms,built_area,land_area,updated_at'

export interface PageMeta {
  title: string
  description: string
  url: string
  image: string | null
  /** Datos estructurados (schema.org) para Google, ya serializados. */
  jsonLd: string | null
}

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Corta en la última palabra que cabe, para que la descripción no termine a medias. */
const shorten = (text: string, length: number) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= length) return clean

  const cut = clean.slice(0, length - 1)
  const lastSpace = cut.lastIndexOf(' ')

  return `${(lastSpace > length / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, '')}…`
}

const formatDollars = (amount: number) =>
  `US$ ${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(amount)}`

export const photoUrl = (supabaseUrl: string, path: string) =>
  `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${PHOTOS_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`

/** El título, la descripción, la foto y los datos estructurados de la ficha de un anuncio. */
export const propertyMeta = (row: PropertyRow, origin: string, supabaseUrl: string): PageMeta => {
  const kind = `${TYPE_LABELS[row.type] ?? 'Propiedad'} ${OPERATION_LABELS[row.operation] ?? ''}`.trim()
  const place = [row.neighborhood, row.city, row.department].filter(Boolean).join(', ')
  const price = `${formatDollars(row.price)}${row.operation === 'alquiler' ? ' al mes' : ''}`
  const url = `${origin}/propiedad/${row.id}`
  const image = row.photos[0] ? photoUrl(supabaseUrl, row.photos[0]) : null
  const description = shorten(`${kind} en ${place} · ${price}. ${row.description}`, DESCRIPTION_LENGTH)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: row.title,
    description: shorten(row.description, 500),
    url,
    image: row.photos.map((path) => photoUrl(supabaseUrl, path)),
    dateModified: row.updated_at,
    offers: {
      '@type': 'Offer',
      price: row.price,
      priceCurrency: 'USD',
      businessFunction: row.operation === 'alquiler' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
    },
    contentLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: row.city,
        addressRegion: row.department,
        addressCountry: 'HN',
      },
    },
  }

  return {
    title: `${row.title} · ${price} | ${BRAND}`,
    description,
    url,
    image,
    // `<` escapado: el texto del anuncio nunca puede cerrar la etiqueta <script>.
    jsonLd: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  }
}

/** Las etiquetas por defecto de index.html, que la ficha de cada anuncio cambia por las suyas. */
const SEO_BLOCK = /<!-- seo[^>]*-->[\s\S]*?<!-- \/seo -->/

/**
 * Completa la cabecera del index.html del sitio: título, descripción, dirección canónica, etiquetas Open Graph
 * (WhatsApp, Facebook) y Twitter, y los datos estructurados. Todo lo que viene del anuncio va escapado.
 */
export const injectMeta = (html: string, meta: PageMeta) => {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const url = escapeHtml(meta.url)
  const tags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:locale" content="es_HN" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    ...(meta.image ? [`<meta property="og:image" content="${escapeHtml(meta.image)}" />`] : []),
    `<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    ...(meta.image ? [`<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`] : []),
    ...(meta.jsonLd ? [`<script type="application/ld+json">${meta.jsonLd}</script>`] : []),
  ]

  const block = `<!-- seo -->\n    ${tags.join('\n    ')}\n    <!-- /seo -->`
  const withTitle = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${description}" />`)

  // Las etiquetas por defecto del sitio (entre <!-- seo --> y <!-- /seo -->) se cambian por las del anuncio.
  return SEO_BLOCK.test(withTitle) ? withTitle.replace(SEO_BLOCK, block) : withTitle.replace('</head>', `    ${block}\n  </head>`)
}

/** Si la dirección es una página que no se indexa: las de cuenta, publicar, administrar o entrar. */
export const isPrivatePath = (path: string) => PRIVATE_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || (prefix.endsWith('/') && path.startsWith(prefix)))

export const robotsTxt = (origin: string) =>
  [
    'User-agent: *',
    'Allow: /',
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n')

export interface SitemapEntry {
  path: string
  lastModified?: string
}

const xmlEscape = (value: string) => escapeHtml(value)

export const sitemapXml = (origin: string, entries: SitemapEntry[]) => {
  const urls = entries.slice(0, MAX_SITEMAP_URLS).map(({ path, lastModified }) => {
    const lastmod = lastModified ? `<lastmod>${xmlEscape(lastModified.slice(0, 10))}</lastmod>` : ''

    return `  <url><loc>${xmlEscape(`${origin}${path}`)}</loc>${lastmod}</url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

/** Lo que necesitan las funciones: cómo pedir a Supabase y cuál es su dirección y su clave pública. */
export interface SeoDependencies {
  fetch: typeof fetch
  supabaseUrl: string | undefined
  supabaseKey: string | undefined
  /**
   * La dirección pública del sitio (`SITE_URL`), para que Google tome siempre la misma aunque se entre por otro
   * dominio, como el de Vercel. Sin ella se usa la dirección con que se pidió la página.
   */
  siteUrl?: string
}

/** La dirección del sitio que se da a los buscadores: la de `SITE_URL` si está, o la de la petición. */
const publicOrigin = (request: Request, siteUrl: string | undefined) => {
  const configured = siteUrl?.trim().replace(/\/+$/, '')

  return configured && /^https?:\/\//.test(configured) ? configured : new URL(request.url).origin
}

const restHeaders = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' })

/** El anuncio publicado con ese identificador, o `null` si no existe, no está publicado o Supabase no responde. */
export const findPublishedProperty = async (id: string, deps: SeoDependencies): Promise<PropertyRow | null> => {
  if (!deps.supabaseUrl || !deps.supabaseKey) return null

  const url = `${deps.supabaseUrl.replace(/\/+$/, '')}/rest/v1/properties?select=${PROPERTY_COLUMNS}&id=eq.${id}&status=eq.published&limit=1`
  const response = await deps.fetch(url, { headers: restHeaders(deps.supabaseKey) })
  if (!response.ok) return null

  const [row] = (await response.json()) as PropertyRow[]

  return row ?? null
}

/** Los anuncios publicados, por páginas, para el mapa del sitio. Si Supabase falla, entrega lo que alcanzó a leer. */
export const listPublishedProperties = async (deps: SeoDependencies): Promise<SitemapEntry[]> => {
  if (!deps.supabaseUrl || !deps.supabaseKey) return []

  const entries: SitemapEntry[] = []
  for (let offset = 0; offset < MAX_SITEMAP_URLS; offset += PAGE_SIZE) {
    const url = `${deps.supabaseUrl.replace(/\/+$/, '')}/rest/v1/properties?select=id,updated_at&status=eq.published&order=created_at.desc&offset=${offset}&limit=${PAGE_SIZE}`
    const response = await deps.fetch(url, { headers: restHeaders(deps.supabaseKey) })
    if (!response.ok) break

    const rows = (await response.json()) as { id: string; updated_at: string }[]
    entries.push(...rows.map((row) => ({ path: `/propiedad/${row.id}`, lastModified: row.updated_at })))
    if (rows.length < PAGE_SIZE) break
  }

  return entries
}

const CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'

/**
 * La ficha de un anuncio: el index.html del sitio con la cabecera de ese anuncio. Si no existe o no está
 * publicado responde 404 con el sitio sin tocar, que muestra su propio aviso. Si Supabase no responde, entrega
 * el sitio igual: la ficha funciona, solo sin vista previa.
 */
export const handlePropertyPage = async (request: Request, deps: SeoDependencies): Promise<Response> => {
  const requestUrl = new URL(request.url)
  const origin = publicOrigin(request, deps.siteUrl)
  const id = requestUrl.searchParams.get('id')

  // El index.html se pide al propio despliegue, no al dominio público: es el de esta misma versión.
  const index = await deps.fetch(new URL('/index.html', requestUrl.origin))
  const html = await index.text()
  const page = (body: string, status: number, cache: string) =>
    new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cache } })

  if (!isPropertyId(id)) return page(html, 404, CACHE)

  let row: PropertyRow | null
  try {
    row = await findPublishedProperty(id, deps)
  } catch {
    return page(html, 200, 'no-store')
  }
  if (!row) return page(html, 404, CACHE)

  return page(injectMeta(html, propertyMeta(row, origin, deps.supabaseUrl ?? '')), 200, CACHE)
}

export const handleSitemap = async (request: Request, deps: SeoDependencies): Promise<Response> => {
  const origin = publicOrigin(request, deps.siteUrl)
  let properties: SitemapEntry[] = []
  try {
    properties = await listPublishedProperties(deps)
  } catch {
    // Sin Supabase, el mapa lleva al menos las páginas fijas.
  }

  return new Response(sitemapXml(origin, [...STATIC_PATHS.map((path) => ({ path })), ...properties]), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  })
}

export const handleRobots = (request: Request, siteUrl?: string): Response =>
  new Response(robotsTxt(publicOrigin(request, siteUrl)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400' },
  })
