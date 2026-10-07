import type { LegalDocumentContent } from '@/features/legal/types/legal.types'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'
import { ROUTES } from '@/shared/constants/routes'

/**
 * Política de privacidad. Dice lo que el sitio hace hoy con los datos, que es poco porque no hay
 * servidor: si cambia qué se guarda o a quién se envía, este texto tiene que cambiar con ello.
 */
export const PRIVACY: LegalDocumentContent = {
  title: 'Política de privacidad',
  summary: `Qué pasa con tus datos cuando usas ${BRAND.name}.`,
  updatedOn: '2026-10-06',
  related: { label: 'Leer los términos y condiciones', to: ROUTES.terms },
  sections: [
    {
      id: 'datos',
      title: 'Qué datos tratamos hoy',
      paragraphs: [`Hoy ${BRAND.name} no tiene un servidor propio que reciba tus datos:`],
      items: [
        'Lo que escribes en los formularios de registro, inicio de sesión, contacto, cotización y reporte no se envía ni se guarda. El sitio te avisa de que el envío aún no está disponible.',
        'Un anuncio que publicas, con sus fotos y su dirección, se guarda solo en tu navegador.',
        'El contador de vistas de cada ficha se guarda también en tu navegador y solo cuenta tus propias visitas.',
      ],
    },
    {
      id: 'terceros',
      title: 'Servicios de terceros',
      paragraphs: [
        'Para funcionar, el sitio carga contenido de otros servicios. Al hacerlo, tu navegador les comunica tu dirección IP, como ocurre en cualquier página web:',
      ],
      items: [
        'GitHub Pages, donde está alojado el sitio.',
        'OpenStreetMap, que dibuja los mapas. Al buscar una dirección para publicar se le envían la colonia, la ciudad y el departamento; nunca la calle ni el número de la casa.',
        'Unsplash, de donde vienen las fotos de los anuncios de ejemplo.',
        'Google Maps, solo si pulsas «Cómo llegar»: recibe el punto de la propiedad para trazar la ruta.',
        'WhatsApp, solo si eliges compartir una ficha por ese medio.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      paragraphs: [`${BRAND.name} no usa cookies propias, ni de publicidad, ni para medir las visitas.`],
    },
    {
      id: 'borrar',
      title: 'Cómo borrar tus datos',
      paragraphs: [
        'Como todo se guarda en tu navegador, puedes borrarlo tú. Al eliminar los datos de este sitio desde la configuración del navegador desaparecen tus anuncios y el contador de vistas.',
      ],
    },
    {
      id: 'futuro',
      title: 'Cuando el servicio esté completo',
      paragraphs: [
        'Cuando existan las cuentas y el envío de mensajes, esta política se actualizará antes de empezar a recoger datos. Explicará qué se guarda, para qué y durante cuánto tiempo.',
      ],
    },
    {
      id: 'contacto',
      title: 'Contacto',
      paragraphs: [`Si tienes dudas sobre tus datos, llámanos al ${CONTACT.phone.display}.`],
    },
  ],
}
