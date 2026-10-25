import { describe, expect, it } from 'vitest'
import { preventIosInputZoom } from '@/lib/iosInputZoom'

const VIEWPORT = 'width=device-width, initial-scale=1.0, viewport-fit=cover'

const device = (userAgent: string, platform = '', maxTouchPoints = 0) =>
  ({ userAgent, platform, maxTouchPoints }) as unknown as Navigator

const page = () => {
  const doc = document.implementation.createHTMLDocument()
  const meta = doc.createElement('meta')
  meta.name = 'viewport'
  meta.content = VIEWPORT
  doc.head.append(meta)
  return { doc, meta }
}

describe('preventIosInputZoom', () => {
  it('en el iPhone, Safari deja de ampliar al tocar un campo', () => {
    // Arrange
    const { doc, meta } = page()

    // Act
    preventIosInputZoom(device('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), doc)

    // Assert
    expect(meta.content).toBe(`${VIEWPORT}, maximum-scale=1`)
  })

  it('también en el iPad, que se presenta como un Mac táctil', () => {
    // Arrange
    const { doc, meta } = page()

    // Act
    preventIosInputZoom(device('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5), doc)

    // Assert
    expect(meta.content).toBe(`${VIEWPORT}, maximum-scale=1`)
  })

  it('en Android y en la computadora no toca el zoom', () => {
    // Arrange
    const { doc, meta } = page()

    // Act
    preventIosInputZoom(device('Mozilla/5.0 (Linux; Android 14; Pixel 8)', 'Linux armv8l', 5), doc)
    preventIosInputZoom(device('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 0), doc)

    // Assert
    expect(meta.content).toBe(VIEWPORT)
  })

  it('no lo agrega dos veces', () => {
    // Arrange
    const { doc, meta } = page()
    const iphone = device('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')

    // Act
    preventIosInputZoom(iphone, doc)
    preventIosInputZoom(iphone, doc)

    // Assert
    expect(meta.content).toBe(`${VIEWPORT}, maximum-scale=1`)
  })
})
