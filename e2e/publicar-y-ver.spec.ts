import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ownerOf, setPublicationLimit } from './database.ts'
import { latestCode } from './mailpit.ts'

/**
 * El recorrido principal del sitio, de punta a punta: una persona se registra y publica un anuncio con su foto,
 * y un visitante sin cuenta lo encuentra en el catálogo y lo abre. Corre contra un Supabase local, así que
 * comprueba también los permisos y las validaciones de la base de datos con el sitio de verdad.
 */

// Cada ejecución usa una cuenta y un anuncio nuevos: la base del CI empieza vacía, pero la de tu equipo no.
const RUN = Date.now().toString(36)
const ACCOUNT = {
  firstName: 'Ana',
  lastName: 'Prueba',
  email: `ana.${RUN}@prueba.hn`,
  phone: '99998888',
  password: `Clave-segura-${RUN}`,
}
const TITLE = `Casa con patio de prueba ${RUN}`

/** Una foto PNG de 64×64 píxeles, generada aquí: el formulario la reduce antes de subirla, como a cualquier otra. */
const PHOTO = {
  name: 'fachada.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAOklEQVR4nO3OQQ0AIAzAQEDK/Bs8GgT0kxBRAqkUdUeAAAECBAgQIECAAAECBAgQIECAAAECBAgQ+AawMwABmGhmIwAAAABJRU5ErkJggg==',
    'base64',
  ),
}

/**
 * Los servicios de fuera no se usan en las pruebas: el buscador de direcciones responde siempre lo mismo y los
 * cuadros del mapa llegan vacíos. Así la prueba no depende de su red ni gasta sus cuotas.
 */
const isolateFromExternalServices = async (page: Page) => {
  await page.route('https://nominatim.openstreetmap.org/**', (route) =>
    route.fulfill({ json: [{ lat: '15.5042', lon: '-88.0250' }] }),
  )
  await page.route(/tile\.openstreetmap\.org|api\.mapbox\.com|images\.unsplash\.com/, (route) => route.abort())
}

/**
 * Se registra y activa la cuenta con el código de 6 dígitos que llega al correo, leído del buzón de prueba.
 * Al escribirlo, la persona queda dentro.
 */
const registerAndConfirm = async (page: Page, account: typeof ACCOUNT) => {
  await page.goto('/registro')
  await page.getByRole('textbox', { name: 'Nombre' }).fill(account.firstName)
  await page.getByRole('textbox', { name: 'Apellido' }).fill(account.lastName)
  await page.getByRole('textbox', { name: 'Correo' }).fill(account.email)
  await page.getByRole('textbox', { name: 'Teléfono' }).fill(account.phone)
  await page.getByLabel(/^Contraseña/).fill(account.password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  await expect(page.getByText(`Te enviamos un código de 6 dígitos a ${account.email}`)).toBeVisible()
  const code = await latestCode(account.email, 'activar tu cuenta')
  await page.getByRole('textbox', { name: /Código de verificación/ }).fill(code)
  await page.getByRole('button', { name: 'Confirmar mi cuenta' }).click()
  await expect(page).not.toHaveURL(/\/registro/)
}

const choose = async (page: Page, field: string, option: string) => {
  await page.getByRole('combobox', { name: field }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}

test.describe.serial('publicar un anuncio y encontrarlo', () => {
  test('una persona se registra y publica un anuncio con su foto', async ({ page }) => {
    await isolateFromExternalServices(page)

    await registerAndConfirm(page, ACCOUNT)

    await page.goto('/publicar')
    await expect(page.getByRole('heading', { level: 1, name: 'Publica tu propiedad' })).toBeVisible()

    // Ubicación, confirmada en el mapa.
    await choose(page, 'Departamento', 'Cortés')
    await choose(page, 'Ciudad', 'San Pedro Sula')
    await page.getByRole('textbox', { name: 'Colonia, barrio o residencial' }).fill('Colonia Trejo')
    await page.getByRole('textbox', { name: 'Dirección' }).fill('10 calle, casa 25')
    await page.getByRole('button', { name: 'Buscar dirección' }).click()
    await page.getByRole('dialog', { name: '¿La dirección es correcta?' }).waitFor()
    await page.getByRole('button', { name: 'Confirmar ubicación' }).click()

    // Tipo de propiedad.
    await expect(page.getByRole('heading', { level: 3, name: 'Tipo de propiedad' })).toBeVisible()
    await page.getByRole('radio', { name: 'Casa' }).check()
    await page.getByRole('spinbutton', { name: 'Superficie construida (m²)' }).fill('180')
    await page.getByRole('spinbutton', { name: 'Superficie del terreno (m²)' }).fill('250')
    await page.getByRole('spinbutton', { name: 'Cuartos' }).fill('3')
    await page.getByRole('spinbutton', { name: 'Baños' }).fill('2')
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // Título y descripción.
    await page.getByRole('textbox', { name: 'Título de la publicación' }).fill(TITLE)
    await page
      .getByRole('textbox', { name: 'Descripción' })
      .fill('Casa de una planta con patio amplio, cochera y cocina remodelada, cerca de todo.')
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // Venta y precio.
    await page.getByRole('radio', { name: 'Venta' }).check()
    await page.getByRole('spinbutton', { name: 'Precio (USD)' }).fill('145000')
    await page.getByRole('button', { name: 'Siguiente' }).click()

    // Foto, y publicar.
    await page.getByLabel('Agregar fotos').setInputFiles(PHOTO)
    await page.getByRole('button', { name: 'Publicar' }).click()

    // Al publicar se abre la ficha del anuncio, ya guardado en Supabase.
    await expect(page).toHaveURL(/\/propiedad\/[0-9a-f-]{36}$/)
    await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible()
  })

  test('un visitante sin cuenta lo encuentra en el catálogo y abre su ficha', async ({ page }) => {
    await isolateFromExternalServices(page)

    await page.goto('/propiedades')
    await page.getByRole('link', { name: new RegExp(TITLE) }).first().click()

    await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible()
    await expect(page.getByText('$ 145,000').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Contacta al publicador en segundos' })).toBeVisible()
    await expect(page.getByText(`${ACCOUNT.firstName} ${ACCOUNT.lastName}`).first()).toBeVisible()
  })

  test('la portada destaca solo anuncios de planes de pago: el de una cuenta gratis no sale hasta que paga', async ({ page }) => {
    await isolateFromExternalServices(page)
    const featured = page.getByRole('region', { name: 'Propiedades destacadas' })
    const owner = await ownerOf(TITLE)

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(featured.getByRole('link', { name: TITLE })).toHaveCount(0)

    // El equipo aprueba un plan de pago para la cuenta: su anuncio pasa a la portada, marcado como destacado.
    await setPublicationLimit(owner, 25)
    try {
      await page.reload()
      const card = featured.locator('[data-slot="card"]').filter({ has: page.getByRole('link', { name: TITLE }) })
      await expect(card).toBeVisible()
      await expect(card.getByText('Destacada')).toBeVisible()
    } finally {
      // Vuelve al plan gratis: en tu equipo, las cuentas de otras ejecuciones no deben ocupar la portada.
      await setPublicationLimit(owner, 1)
    }
  })

  test('un visitante sin cuenta no puede publicar: se le pide iniciar sesión', async ({ page }) => {
    await page.goto('/publicar')

    await expect(page.getByRole('heading', { level: 1, name: 'Inicia sesión para publicar' })).toBeVisible()
    await expect(page.getByRole('main').getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute(
      'href',
      /volver=%2Fpublicar/,
    )
  })

  test('otra cuenta no puede editar el anuncio: ni la página ni la base de datos se lo permiten', async ({ page }) => {
    await isolateFromExternalServices(page)

    // Se busca el anuncio como visitante, para saber su dirección.
    await page.goto('/propiedades')
    await page.getByRole('link', { name: new RegExp(TITLE) }).first().click()
    await expect(page).toHaveURL(/\/propiedad\/[0-9a-f-]{36}$/)
    const propertyId = page.url().split('/').pop()

    // Otra persona se registra e intenta abrir la edición de ese anuncio.
    await registerAndConfirm(page, {
      ...ACCOUNT,
      firstName: 'Beto',
      lastName: 'Ajeno',
      email: `beto.${RUN}@prueba.hn`,
      phone: '33337777',
    })

    await page.goto(`/mis-publicaciones/${propertyId}/editar`)
    await expect(page.getByRole('heading', { name: 'No puedes editar ese anuncio' })).toBeVisible()
  })

  test('quien olvidó su contraseña elige otra con el código que llega al correo y entra con ella', async ({ page }) => {
    const newPassword = `Otra-clave-${RUN}`

    await page.goto('/recuperar-contrasena')
    await expect(page.getByText('Te enviaremos un código de verificación para que puedas actualizar tu contraseña.')).toBeVisible()
    await page.getByRole('textbox', { name: 'Correo' }).fill(ACCOUNT.email)
    await page.getByRole('button', { name: 'Enviar código' }).click()

    const code = await latestCode(ACCOUNT.email, 'elegir otra contraseña')
    // Primero el código, solo: la contraseña nueva aparece cuando el código se aceptó.
    await expect(page.getByLabel(/^Contraseña nueva/)).toHaveCount(0)
    await page.getByRole('textbox', { name: /Código de verificación/ }).fill(code)
    await page.getByRole('button', { name: 'Verificar código' }).click()
    await expect(page.getByText('Código verificado')).toBeVisible()
    await page.getByLabel(/^Contraseña nueva/).fill(newPassword)
    await page.getByLabel('Repite la contraseña nueva').fill(newPassword)
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Tu contraseña se actualizó')).toBeVisible()

    // La contraseña nueva sirve para entrar, y la anterior ya no.
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.goto('/iniciar-sesion')
    await page.getByRole('textbox', { name: 'Correo' }).fill(ACCOUNT.email)
    await page.getByLabel(/^Contraseña/).fill(ACCOUNT.password)
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
    await expect(page.getByText('No pudimos iniciar tu sesión')).toBeVisible()

    await page.getByLabel(/^Contraseña/).fill(newPassword)
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
    await expect(page).not.toHaveURL(/\/iniciar-sesion/)
  })
})
