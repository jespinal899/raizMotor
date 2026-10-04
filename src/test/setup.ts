import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

// jsdom no implementa las direcciones temporales con las que se muestran las fotos elegidas.
URL.createObjectURL = (file) => `blob:${file instanceof File ? file.name : 'objeto'}`
URL.revokeObjectURL = () => {}
