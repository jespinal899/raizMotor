import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'

const renderLayout = () =>
  render(
    <PropertyDetailLayout
      aria-label="Ficha de prueba"
      breadcrumb={<nav aria-label="Ruta">Ruta</nav>}
      actions={<p>Acciones</p>}
      header={<h1>Título</h1>}
      gallery={<div>Fotos</div>}
      sidebar={<p>Formulario</p>}
    >
      <p>Descripción</p>
    </PropertyDetailLayout>,
  )

const follows = (first: HTMLElement, second: HTMLElement) =>
  Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

describe('PropertyDetailLayout', () => {
  it('coloca cada bloque dentro de la ficha', () => {
    // Arrange: estructura con contenido de prueba en cada hueco

    // Act
    renderLayout()

    // Assert
    const article = screen.getByRole('article', { name: 'Ficha de prueba' })
    expect(within(article).getByRole('navigation', { name: 'Ruta' })).toBeInTheDocument()
    expect(within(article).getByText('Acciones')).toBeInTheDocument()
    expect(within(article).getByRole('heading', { level: 1, name: 'Título' })).toBeInTheDocument()
    expect(within(article).getByText('Fotos')).toBeInTheDocument()
    expect(within(article).getByText('Descripción')).toBeInTheDocument()
  })

  it('pone la barra lateral en una región complementaria', () => {
    // Arrange: estructura con contenido de prueba en cada hueco

    // Act
    renderLayout()

    // Assert
    expect(within(screen.getByRole('complementary')).getByText('Formulario')).toBeInTheDocument()
  })

  it('las acciones comparten fila con la ruta, antes del título', () => {
    // Arrange: estructura con contenido de prueba en cada hueco

    // Act
    renderLayout()

    // Assert
    const route = screen.getByRole('navigation', { name: 'Ruta' })
    const actions = screen.getByText('Acciones')
    expect(route.parentElement).toBe(actions.parentElement)
    expect(follows(route, actions)).toBe(true)
    expect(follows(actions, screen.getByRole('heading', { level: 1 }))).toBe(true)
  })

  it('el título va en la misma columna que las fotos, para que la barra lateral empiece a su altura', () => {
    // Arrange: estructura con contenido de prueba en cada hueco

    // Act
    renderLayout()

    // Assert
    const title = screen.getByRole('heading', { level: 1 })
    expect(title.parentElement).toBe(screen.getByText('Fotos').parentElement)
    expect(title.parentElement).not.toContainElement(screen.getByRole('complementary'))
  })

  it('en el documento el orden es título, fotos, barra lateral y descripción', () => {
    // Arrange: ese orden es el que se ve en móvil, donde todo se apila

    // Act
    renderLayout()

    // Assert
    const order = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByText('Fotos'),
      screen.getByText('Formulario'),
      screen.getByText('Descripción'),
    ]
    expect(order.slice(1).every((block, position) => follows(order[position], block))).toBe(true)
  })

  it('lo que ocupa el ancho de las dos columnas va bajo ellas, dentro de los márgenes de la ficha', () => {
    // Arrange
    const withWideBlock = (
      <PropertyDetailLayout
        aria-label="Ficha de prueba"
        breadcrumb={<nav aria-label="Ruta">Ruta</nav>}
        header={<h1>Título</h1>}
        gallery={<div>Fotos</div>}
        sidebar={<p>Formulario</p>}
        wide={<div>Mapa</div>}
      >
        <p>Descripción</p>
      </PropertyDetailLayout>
    )

    // Act
    render(withWideBlock)

    // Assert
    const article = screen.getByRole('article', { name: 'Ficha de prueba' })
    const map = within(article).getByText('Mapa')
    const columns = screen.getByRole('complementary').parentElement
    // Los márgenes los pone el mismo bloque que contiene la ruta: el mapa tiene que estar dentro de él.
    const margins = screen.getByRole('navigation', { name: 'Ruta' }).parentElement?.parentElement
    expect(follows(screen.getByText('Descripción'), map)).toBe(true)
    expect(margins).toContainElement(map)
    expect(columns).toContainElement(screen.getByText('Descripción'))
    expect(columns).not.toContainElement(map)
  })

  it('sin acciones, como en el esqueleto de carga, la ruta va sola', () => {
    // Arrange
    const withoutActions = (
      <PropertyDetailLayout
        breadcrumb={<nav aria-label="Ruta">Ruta</nav>}
        header={<h1>Título</h1>}
        gallery={<div>Fotos</div>}
        sidebar={<p>Formulario</p>}
      />
    )

    // Act
    render(withoutActions)

    // Assert
    expect(screen.getByRole('navigation', { name: 'Ruta' }).parentElement?.children).toHaveLength(1)
  })
})
