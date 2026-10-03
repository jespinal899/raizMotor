import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HeroCarousel from '@/features/home/components/HeroCarousel'
import { HERO_SLIDES } from '@/features/home/data/heroSlides.data'
import { renderWithRouter } from '@/test/renderWithRouter'

const activeSlideTitle = () => {
  const active = document.querySelector<HTMLElement>('[aria-roledescription="slide"][data-active="true"]')
  if (!active) throw new Error('No hay ningún slide activo')
  return within(active).getByRole('heading').textContent
}

const progressBar = () => {
  const bar = document.querySelector('[data-slot="carousel-progress"]')
  if (!bar) throw new Error('No se encontró la barra de progreso')
  return bar
}

const [firstSlide, secondSlide, thirdSlide] = HERO_SLIDES
const AUTOPLAY_MS = 6000

describe('HeroCarousel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el primer slide como activo', () => {
    // Arrange: carrusel recién montado

    // Act
    renderWithRouter(<HeroCarousel />)

    // Assert
    expect(activeSlideTitle()).toBe(firstSlide.title)
    expect(screen.getByRole('button', { name: 'Ir al slide 1' })).toHaveAttribute('aria-current', 'true')
  })

  it('renderiza cada slide con sus dos botones de acción', () => {
    // Arrange
    const expectedLinks = HERO_SLIDES.flatMap((slide) => [slide.primaryAction.label, slide.secondaryAction.label])

    // Act
    renderWithRouter(<HeroCarousel />)

    // Assert
    const links = screen.getAllByRole('link', { hidden: true }).map((link) => link.textContent)
    expect(links).toEqual(expectedLinks)
  })

  it('la flecha siguiente avanza un slide', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<HeroCarousel />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Slide siguiente' }))

    // Assert
    expect(activeSlideTitle()).toBe(secondSlide.title)
  })

  it('la flecha anterior desde el primero va al último', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<HeroCarousel />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Slide anterior' }))

    // Assert
    expect(activeSlideTitle()).toBe(thirdSlide.title)
  })

  it('un dot lleva directamente a su slide', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<HeroCarousel />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Ir al slide 3' }))

    // Assert
    expect(activeSlideTitle()).toBe(thirdSlide.title)
    expect(screen.getByRole('button', { name: 'Ir al slide 3' })).toHaveAttribute('aria-current', 'true')
  })

  it('avanza solo al cumplirse los 6 segundos', () => {
    // Arrange
    vi.useFakeTimers()
    renderWithRouter(<HeroCarousel />)

    // Act
    act(() => {
      vi.advanceTimersByTime(AUTOPLAY_MS)
    })

    // Assert
    expect(activeSlideTitle()).toBe(secondSlide.title)
  })

  it('no avanza mientras el ratón está encima', () => {
    // Arrange
    vi.useFakeTimers()
    renderWithRouter(<HeroCarousel />)
    fireEvent.pointerEnter(screen.getByRole('region', { name: 'Destacados' }), { pointerType: 'mouse' })

    // Act
    act(() => {
      vi.advanceTimersByTime(AUTOPLAY_MS * 2)
    })

    // Assert
    expect(activeSlideTitle()).toBe(firstSlide.title)
  })

  it('la barra dura 6 segundos y corre mientras nadie interactúa', () => {
    // Arrange: carrusel recién montado

    // Act
    renderWithRouter(<HeroCarousel />)

    // Assert
    expect(progressBar()).toHaveStyle({ animationDuration: '6000ms', animationPlayState: 'running' })
  })

  it('pausa la barra mientras el ratón está encima', () => {
    // Arrange
    renderWithRouter(<HeroCarousel />)
    const carousel = screen.getByRole('region', { name: 'Destacados' })

    // Act
    fireEvent.pointerEnter(carousel, { pointerType: 'mouse' })

    // Assert
    expect(progressBar()).toHaveStyle({ animationPlayState: 'paused' })
  })

  it('las flechas del teclado cambian de slide', () => {
    // Arrange
    renderWithRouter(<HeroCarousel />)

    // Act
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Assert
    expect(activeSlideTitle()).toBe(secondSlide.title)
  })

  it('marca como inactivos los slides que no se ven', () => {
    // Arrange: carrusel recién montado

    // Act
    renderWithRouter(<HeroCarousel />)

    // Assert
    const slides = [...document.querySelectorAll('[aria-roledescription="slide"]')]
    expect(slides.map((slide) => slide.hasAttribute('inert'))).toEqual([false, true, true])
  })
})
