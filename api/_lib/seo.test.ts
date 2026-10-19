import { describe, expect, it, vi } from 'vitest'
import {
  PAGE_SIZE,
  escapeHtml,
  handleProjectPage,
  handlePropertyPage,
  handleRobots,
  handleSitemap,
  injectMeta,
  isPrivatePath,
  projectMeta,
  propertyMeta,
} from './seo'
import type { ProjectRow, PropertyRow, SeoDependencies } from './seo'
// El index.html de verdad: así se prueba que la cabecera que se completa es la que se publica.
import INDEX_HTML from '../../index.html?raw'

const ORIGIN = 'https://www.domusraiz.hn'
const SUPABASE = 'https://proyecto.supabase.co'
const ID = '3f0c2a54-6f0e-4a35-9b6f-0d6f1f6c2a11'

const ROW: PropertyRow = {
  id: ID,
  title: 'Casa amplia con patio en Palmira',
  description: 'Tres habitaciones, jardín y cochera para dos carros. A dos cuadras del bulevar.',
  type: 'casa',
  operation: 'venta',
  price: 185000,
  department: 'Francisco Morazán',
  city: 'Tegucigalpa',
  neighborhood: 'Colonia Palmira',
  photos: ['cuenta/clave/0.webp', 'cuenta/clave/1.webp'],
  bedrooms: 3,
  bathrooms: 2,
  built_area: 180,
  land_area: 300,
  updated_at: '2026-10-10T12:00:00Z',
}

const PROJECT: ProjectRow = {
  id: ID,
  name: 'Torre Vista Lomas',
  description: 'Torre de 14 niveles con piscina en la azotea, gimnasio y seguridad las 24 horas.',
  kind: 'torre',
  stage: 'preventa',
  price_from: 89000,
  department: 'Francisco Morazán',
  city: 'Tegucigalpa',
  neighborhood: 'Lomas del Guijarro',
  photos: ['cuenta/torre/0.webp', 'https://images.unsplash.com/photo-1?w=1200'],
  developer_name: 'Constructora Norte',
  delivery_date: '2027-12-01',
  updated_at: '2026-10-18T12:00:00Z',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/** Un Supabase y un sitio simulados: el index.html sale del propio sitio y los anuncios, de la API de Supabase. */
const depsWith = (respond: (url: string) => Response | Promise<Response>): SeoDependencies & { fetch: ReturnType<typeof vi.fn> } => {
  const fake = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.endsWith('/index.html')) return new Response(INDEX_HTML)

    return respond(url)
  })

  return { fetch: fake as unknown as typeof fetch & ReturnType<typeof vi.fn>, supabaseUrl: SUPABASE, supabaseKey: 'clave-publica' }
}

const pageRequest = (id: string) => new Request(`${ORIGIN}/api/propiedad?id=${id}`)

describe('propertyMeta', () => {
  it('describe el anuncio con su tipo, su zona y su precio', () => {
    // Arrange: un anuncio publicado

    // Act
    const meta = propertyMeta(ROW, ORIGIN, SUPABASE)

    // Assert
    expect(meta.title).toBe('Casa amplia con patio en Palmira · US$ 185,000 | DomusRaíz')
    expect(meta.description).toMatch(/^Casa en venta en Colonia Palmira, Tegucigalpa, Francisco Morazán · US\$ 185,000\. Tres/)
    expect(meta.url).toBe(`${ORIGIN}/propiedad/${ID}`)
    expect(meta.image).toBe(`${SUPABASE}/storage/v1/object/public/property-photos/cuenta/clave/0.webp`)
  })

  it('en un alquiler dice que el precio es al mes', () => {
    // Arrange
    const rental = { ...ROW, operation: 'alquiler', price: 650 }

    // Act
    const meta = propertyMeta(rental, ORIGIN, SUPABASE)

    // Assert
    expect(meta.title).toContain('US$ 650 al mes')
    expect(meta.description).toContain('Casa en alquiler')
  })

  it('acorta la descripción sin dejar una palabra a medias', () => {
    // Arrange
    const long = { ...ROW, description: 'palabra '.repeat(80) }

    // Act
    const meta = propertyMeta(long, ORIGIN, SUPABASE)

    // Assert
    expect(meta.description.length).toBeLessThanOrEqual(160)
    expect(meta.description).toMatch(/palabra…$/)
  })

  it('da a Google el precio, la moneda y la ciudad en datos estructurados', () => {
    // Arrange: un anuncio publicado

    // Act
    const data = JSON.parse(propertyMeta(ROW, ORIGIN, SUPABASE).jsonLd ?? '{}')

    // Assert
    expect(data['@type']).toBe('RealEstateListing')
    expect(data.offers).toMatchObject({ price: 185000, priceCurrency: 'USD' })
    expect(data.contentLocation.address).toMatchObject({ addressLocality: 'Tegucigalpa', addressCountry: 'HN' })
    expect(data.image).toHaveLength(2)
  })

  it('el texto del anuncio nunca puede cerrar la etiqueta de los datos estructurados', () => {
    // Arrange
    const hostile = { ...ROW, description: '</script><script>alert(1)</script>' }

    // Act
    const { jsonLd } = propertyMeta(hostile, ORIGIN, SUPABASE)

    // Assert
    expect(jsonLd).not.toContain('</script>')
  })
})

describe('injectMeta', () => {
  it('cambia el título, la descripción y las etiquetas por defecto por las del anuncio', () => {
    // Arrange
    const meta = propertyMeta(ROW, ORIGIN, SUPABASE)

    // Act
    const html = injectMeta(INDEX_HTML, meta)

    // Assert
    expect(html).toContain(`<title>${escapeHtml(meta.title)}</title>`)
    expect(html).toContain(`<meta property="og:image" content="${meta.image}" />`)
    expect(html).toContain(`<link rel="canonical" href="${meta.url}" />`)
    expect(html.match(/property="og:title"/g)).toHaveLength(1)
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html).toContain('<script type="module"')
  })

  it('escapa lo que escribió quien publicó', () => {
    // Arrange
    const meta = propertyMeta({ ...ROW, title: 'Casa "linda" <b>barata</b>' }, ORIGIN, SUPABASE)

    // Act
    const html = injectMeta(INDEX_HTML, meta)

    // Assert
    expect(html).not.toContain('<b>barata</b>')
    expect(html).toContain('Casa &quot;linda&quot; &lt;b&gt;barata&lt;/b&gt;')
  })
})

describe('handlePropertyPage', () => {
  it('entrega el sitio con la cabecera del anuncio publicado', async () => {
    // Arrange
    const deps = depsWith(() => json([ROW]))

    // Act
    const response = await handlePropertyPage(pageRequest(ID), deps)

    // Assert
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/html')
    expect(await response.text()).toContain('og:title" content="Casa amplia con patio en Palmira')
  })

  it('solo pide a Supabase anuncios publicados, con la clave pública', async () => {
    // Arrange
    const deps = depsWith(() => json([ROW]))

    // Act
    await handlePropertyPage(pageRequest(ID), deps)

    // Assert
    const [url, init] = deps.fetch.mock.calls.find(([input]) => String(input).includes('/rest/v1/')) ?? []
    expect(String(url)).toContain(`id=eq.${ID}`)
    expect(String(url)).toContain('status=eq.published')
    expect(init.headers.apikey).toBe('clave-publica')
  })

  it('si el anuncio no existe o no está publicado, responde 404 con el sitio sin tocar', async () => {
    // Arrange
    const deps = depsWith(() => json([]))

    // Act
    const response = await handlePropertyPage(pageRequest(ID), deps)

    // Assert
    expect(response.status).toBe(404)
    expect(await response.text()).toBe(INDEX_HTML)
  })

  it('con un identificador que no es de un anuncio no pregunta a Supabase', async () => {
    // Arrange
    const deps = depsWith(() => json([ROW]))

    // Act
    const response = await handlePropertyPage(pageRequest('casa-de-ejemplo'), deps)

    // Assert
    expect(response.status).toBe(404)
    expect(deps.fetch.mock.calls.some(([input]) => String(input).includes('/rest/v1/'))).toBe(false)
  })

  it('si Supabase no responde, la ficha se abre igual, sin vista previa', async () => {
    // Arrange
    const deps = depsWith(() => Promise.reject(new Error('sin red')))

    // Act
    const response = await handlePropertyPage(pageRequest(ID), deps)

    // Assert
    expect(response.status).toBe(200)
    expect(await response.text()).toBe(INDEX_HTML)
  })
  it('con SITE_URL, la dirección canónica es la del sitio aunque se entre por otro dominio', async () => {
    // Arrange
    const deps = { ...depsWith(() => json([ROW])), siteUrl: 'https://www.jespinal03.casa/' }

    // Act
    const html = await (await handlePropertyPage(new Request(`https://raiz-motor.vercel.app/api/propiedad?id=${ID}`), deps)).text()

    // Assert
    expect(html).toContain(`<link rel="canonical" href="https://www.jespinal03.casa/propiedad/${ID}" />`)
    expect(deps.fetch).toHaveBeenCalledWith(new URL('https://raiz-motor.vercel.app/index.html'))
  })
})

describe('projectMeta', () => {
  it('describe el proyecto con su tipo, su etapa, su zona y su precio desde', () => {
    // Arrange: un proyecto publicado

    // Act
    const meta = projectMeta(PROJECT, ORIGIN, SUPABASE)

    // Assert
    expect(meta.title).toBe('Torre Vista Lomas · Desde US$ 89,000 | DomusRaíz')
    expect(meta.description.startsWith('Torre de apartamentos en preventa en Lomas del Guijarro, Tegucigalpa')).toBe(true)
    expect(meta.url).toBe(`${ORIGIN}/proyectos/${ID}`)
    expect(meta.image).toBe(`${SUPABASE}/storage/v1/object/public/project-photos/cuenta/torre/0.webp`)
  })

  it('da a Google el precio desde, la desarrolladora y la entrega, y respeta las fotos que ya son una dirección', () => {
    // Arrange: un proyecto publicado

    // Act
    const data = JSON.parse(projectMeta(PROJECT, ORIGIN, SUPABASE).jsonLd!)

    // Assert
    expect(data.offers).toMatchObject({
      lowPrice: 89000,
      priceCurrency: 'USD',
      offeredBy: { name: 'Constructora Norte' },
      availabilityStarts: '2027-12-01',
    })
    expect(data.image[1]).toBe('https://images.unsplash.com/photo-1?w=1200')
  })
})

describe('handleProjectPage', () => {
  it('entrega el sitio con la cabecera del proyecto publicado, pidiendo solo proyectos publicados', async () => {
    // Arrange
    const deps = depsWith(() => json([PROJECT]))

    // Act
    const response = await handleProjectPage(new Request(`${ORIGIN}/api/proyecto?id=${ID}`), deps)
    const html = await response.text()

    // Assert
    expect(response.status).toBe(200)
    expect(html).toContain('<title>Torre Vista Lomas · Desde US$ 89,000 | DomusRaíz</title>')
    expect(html).toContain(`<meta property="og:url" content="${ORIGIN}/proyectos/${ID}" />`)
    const supabaseCall = String(deps.fetch.mock.calls.find(([url]) => String(url).includes('/rest/v1/'))?.[0])
    expect(supabaseCall).toContain('/rest/v1/projects?')
    expect(supabaseCall).toContain('status=eq.published')
  })

  it('si el proyecto no existe o no está publicado, responde 404 con el sitio sin tocar', async () => {
    // Arrange
    const deps = depsWith(() => json([]))

    // Act
    const response = await handleProjectPage(new Request(`${ORIGIN}/api/proyecto?id=${ID}`), deps)

    // Assert
    expect(response.status).toBe(404)
    expect(await response.text()).toBe(INDEX_HTML)
  })
})

describe('handleSitemap', () => {
  it('lista las páginas públicas y cada anuncio publicado, leyendo por páginas', async () => {
    // Arrange
    const rows = Array.from({ length: PAGE_SIZE + 2 }, (_, index) => ({
      id: `${String(index).padStart(8, '0')}-0000-4000-8000-000000000000`,
      updated_at: '2026-10-10T12:00:00Z',
    }))
    const deps = depsWith((url) => {
      const offset = Number(new URL(url).searchParams.get('offset'))

      return json(rows.slice(offset, offset + PAGE_SIZE))
    })

    // Act
    const xml = await (await handleSitemap(new Request(`${ORIGIN}/sitemap.xml`), deps)).text()

    // Assert
    expect(xml).toContain(`<loc>${ORIGIN}/</loc>`)
    expect(xml).toContain(`<loc>${ORIGIN}/propiedades</loc>`)
    expect(xml.match(/\/propiedad\//g)).toHaveLength(PAGE_SIZE + 2)
    expect(xml.match(/\/proyectos\/[0-9]/g)).toHaveLength(PAGE_SIZE + 2)
    expect(xml).toContain(`<loc>${ORIGIN}/proyectos</loc>`)
    expect(xml).toContain('<lastmod>2026-10-10</lastmod>')
    expect(xml).not.toContain('/publicar')
  })

  it('si Supabase no responde, lleva al menos las páginas fijas', async () => {
    // Arrange
    const deps = depsWith(() => Promise.reject(new Error('sin red')))

    // Act
    const response = await handleSitemap(new Request(`${ORIGIN}/sitemap.xml`), deps)

    // Assert
    expect(response.status).toBe(200)
    expect(await response.text()).toContain(`<loc>${ORIGIN}/planes</loc>`)
  })
})

describe('handleRobots', () => {
  it('cierra a los buscadores las páginas de cuenta y señala el mapa del sitio', async () => {
    // Arrange: sin estado

    // Act
    const text = await handleRobots(new Request(`${ORIGIN}/robots.txt`)).text()

    // Assert
    expect(text).toContain('Disallow: /admin')
    expect(text).toContain('Disallow: /mi-cuenta')
    expect(text).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
  })

  it.each([
    ['/admin', true],
    ['/mis-publicaciones/abc/editar', true],
    ['/planes/agente-inmobiliario/contratar/agente-plan-1', true],
    ['/propiedad/abc', false],
    ['/planes', false],
  ])('%s es privada: %s', (path, expected) => {
    // Arrange: sin estado

    // Act
    const result = isPrivatePath(path)

    // Assert
    expect(result).toBe(expected)
  })
})
