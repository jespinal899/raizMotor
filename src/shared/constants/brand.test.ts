import { describe, expect, it } from 'vitest'
import { LOGO_PATHS } from '@/components/layout/logoPaths'
import { BRAND } from '@/shared/constants/brand'
import favicon from '../../../public/favicon.svg?raw'
import indexHtml from '../../../index.html?raw'

// index.html y el favicon son archivos estáticos que no pueden leer estas constantes:
// estas pruebas avisan si alguien cambia la marca en un sitio y olvida el otro.
describe('marca en los archivos estáticos', () => {
  it('el título inicial de la pestaña es el nombre de la marca', () => {
    // Arrange
    const expectedTitle = `<title>${BRAND.name}</title>`

    // Act
    const hasTitle = indexHtml.includes(expectedTitle)

    // Assert
    expect(hasTitle).toBe(true)
  })

  it('la descripción de la página es el lema de la marca', () => {
    // Arrange
    const expectedContent = `content="${BRAND.tagline}"`

    // Act
    const hasDescription = indexHtml.includes(expectedContent)

    // Assert
    expect(hasDescription).toBe(true)
  })

  it('la página se declara en español', () => {
    // Arrange
    const expectedAttribute = '<html lang="es">'

    // Act
    const declaresSpanish = indexHtml.includes(expectedAttribute)

    // Assert
    expect(declaresSpanish).toBe(true)
  })

  it('el favicon dibuja los mismos trazos que el logo', () => {
    // Arrange
    const expectedPaths = [...LOGO_PATHS]

    // Act
    const faviconPaths = [...favicon.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1])

    // Assert
    expect(faviconPaths).toEqual(expectedPaths)
  })
})
