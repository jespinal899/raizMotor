import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

// Cada prueba empieza sin lo que otra haya guardado en el navegador de pruebas.
afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

// jsdom no implementa las direcciones temporales con las que se muestran las fotos elegidas.
URL.createObjectURL = (file) => `blob:${file instanceof File ? file.name : 'objeto'}`
URL.revokeObjectURL = () => {}

// jsdom tampoco implementa el desplazamiento hasta un elemento.
Element.prototype.scrollIntoView = () => {}
