import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InstallAppBanner from '@/components/layout/InstallAppBanner'
import { DISMISSED_KEY } from '@/hooks/useInstallApp'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36'

const usingPhone = (userAgent: string) => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)

const installedAsApp = (installed: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: installed, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  )

/** Chrome avisa de que el sitio se puede instalar; la persona responde `outcome` en su cuadro. */
const chromeOffersInstall = (outcome: 'accepted' | 'dismissed') => {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome }),
  })
  act(() => {
    window.dispatchEvent(event)
  })

  return event
}

const banner = () => screen.queryByRole('complementary', { name: 'Instalar DomusRaíz' })

describe('InstallAppBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    installedAsApp(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('en el iPhone explica cómo agregarla a la pantalla de inicio', () => {
    // Arrange
    usingPhone(IPHONE)

    // Act
    render(<InstallAppBanner />)

    // Assert
    expect(banner()).toHaveTextContent('Agregar a inicio')
    expect(screen.queryByRole('button', { name: 'Instalar' })).not.toBeInTheDocument()
  })

  it('en Android, cuando Chrome lo permite, instala con un toque', async () => {
    // Arrange
    usingPhone(ANDROID)
    render(<InstallAppBanner />)
    expect(banner()).not.toBeInTheDocument()
    const offer = chromeOffersInstall('accepted')

    // Act
    await userEvent.setup().click(screen.getByRole('button', { name: 'Instalar' }))

    // Assert
    expect(offer.defaultPrevented).toBe(true)
    expect(offer.prompt).toHaveBeenCalled()
    expect(banner()).not.toBeInTheDocument()
  })

  it('«Ahora no» la cierra y no vuelve a salir', async () => {
    // Arrange
    usingPhone(IPHONE)
    const { unmount } = render(<InstallAppBanner />)

    // Act
    await userEvent.setup().click(screen.getByRole('button', { name: 'Ahora no' }))

    // Assert
    expect(banner()).not.toBeInTheDocument()
    expect(localStorage.getItem(DISMISSED_KEY)).not.toBeNull()
    unmount()
    render(<InstallAppBanner />)
    expect(banner()).not.toBeInTheDocument()
  })

  it('abierta ya como aplicación no invita a instalarla', () => {
    // Arrange
    usingPhone(IPHONE)
    installedAsApp(true)

    // Act
    render(<InstallAppBanner />)

    // Assert
    expect(banner()).not.toBeInTheDocument()
  })

  it('en una computadora sin la oferta de Chrome no muestra nada', () => {
    // Arrange
    usingPhone('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/140.0')

    // Act
    render(<InstallAppBanner />)

    // Assert
    expect(banner()).not.toBeInTheDocument()
  })
})
