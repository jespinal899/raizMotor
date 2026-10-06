import { screen } from '@testing-library/react'

/** Las opciones, el comentario y el botón del reporte, buscados como los percibe quien usa la ventana. */
export const reportForm = {
  form: () => screen.getByRole('form', { name: 'Reporte de la publicación' }),
  reasons: () => screen.getByRole('radiogroup', { name: 'Motivo' }),
  reason: (name: string) => screen.getByRole('radio', { name }),
  details: () => screen.getByRole('textbox', { name: /^Cuéntanos más/ }),
  submitButton: () => screen.getByRole('button', { name: /^Enviar reporte$|Enviando/ }),
}
