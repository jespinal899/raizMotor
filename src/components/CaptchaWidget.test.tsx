import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CaptchaWidget from '@/components/CaptchaWidget'
import type { TurnstileApi } from '@/components/CaptchaWidget'
import { createCaptchaSession } from '@/lib/captcha'

type RenderOptions = Parameters<TurnstileApi['render']>[1]

/** Un Turnstile de mentira que guarda con qué opciones se pintó, para que la prueba resuelva el widget. */
const fakeTurnstile = () => {
  let options: RenderOptions | undefined
  const api = {
    render: vi.fn<TurnstileApi['render']>((_container, given) => {
      options = given
      return 'widget-1'
    }),
    reset: vi.fn<TurnstileApi['reset']>(),
    remove: vi.fn<TurnstileApi['remove']>(),
  }

  return { api, load: vi.fn(async () => api), options: () => options! }
}

describe('CaptchaWidget', () => {
  it('sin clave del sitio no muestra nada ni carga Turnstile', () => {
    // Arrange
    const { load } = fakeTurnstile()

    // Act
    const { container } = render(<CaptchaWidget siteKey={null} load={load} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
    expect(load).not.toHaveBeenCalled()
  })

  it('con clave pinta el widget en español y guarda el token que entrega', async () => {
    // Arrange
    const turnstile = fakeTurnstile()
    const session = createCaptchaSession()

    // Act
    render(<CaptchaWidget siteKey="clave-del-sitio" session={session} load={turnstile.load} />)
    await waitFor(() => expect(turnstile.api.render).toHaveBeenCalled())
    turnstile.options().callback('token-1')

    // Assert
    expect(turnstile.options()).toMatchObject({ sitekey: 'clave-del-sitio', language: 'es' })
    expect(session.takeToken()).toBe('token-1')
  })

  it('se reinicia cada vez que se usa el token, porque no sirve dos veces', async () => {
    // Arrange
    const turnstile = fakeTurnstile()
    const session = createCaptchaSession()
    render(<CaptchaWidget siteKey="clave-del-sitio" session={session} load={turnstile.load} />)
    await waitFor(() => expect(turnstile.api.render).toHaveBeenCalled())

    // Act
    session.takeToken()

    // Assert
    expect(turnstile.api.reset).toHaveBeenCalledExactlyOnceWith('widget-1')
  })

  it('al salir del formulario retira el widget y olvida el token', async () => {
    // Arrange
    const turnstile = fakeTurnstile()
    const session = createCaptchaSession()
    const { unmount } = render(<CaptchaWidget siteKey="clave-del-sitio" session={session} load={turnstile.load} />)
    await waitFor(() => expect(turnstile.api.render).toHaveBeenCalled())
    turnstile.options().callback('token-1')

    // Act
    unmount()

    // Assert
    expect(turnstile.api.remove).toHaveBeenCalledExactlyOnceWith('widget-1')
    expect(session.takeToken()).toBeNull()
  })
})
