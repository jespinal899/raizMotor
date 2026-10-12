import type { LegalDocumentContent } from '@/features/legal/types/legal.types'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'
import { ROUTES } from '@/shared/constants/routes'

/**
 * Política de privacidad. Dice lo que el sitio hace hoy con los datos: si cambia qué se guarda o a quién se
 * envía, este texto tiene que cambiar con ello. Es un texto preliminar, pendiente de revisión legal.
 */
export const PRIVACY: LegalDocumentContent = {
  title: 'Política de privacidad',
  summary: `Qué pasa con tus datos cuando usas ${BRAND.name}.`,
  updatedOn: '2026-10-12',
  related: { label: 'Leer los términos y condiciones', to: ROUTES.terms },
  sections: [
    {
      id: 'datos',
      title: 'Qué datos tratamos',
      paragraphs: [`Estos son los datos que ${BRAND.name} guarda o envía, y para qué:`],
      items: [
        'Tu cuenta: tu correo, tu nombre, tu apellido y tu teléfono. Tu nombre y tu teléfono se muestran en tus anuncios, para que quien esté interesado te escriba.',
        'Tus anuncios: lo que escribes en ellos, sus fotos y su dirección. Los ve cualquier visitante mientras estén publicados.',
        'Contactar al publicador: el nombre, el correo y el teléfono que escribes en la ficha de un anuncio se envían por correo a quien lo publicó, para que te contacte. No los guardamos: solo anotamos que se hizo un envío y sobre qué anuncio, para no mandarlo dos veces y para limitar los abusos.',
        'Los reportes de anuncios: el motivo y el comentario que escribes, y tu cuenta si tenías la sesión abierta. Los lee el equipo del sitio para revisar el anuncio.',
        'Para proteger el sitio de abusos guardamos una huella de tu dirección IP, nunca la IP tal cual, durante como mucho un día.',
        'El contador de vistas de cada ficha se guarda en tu navegador y solo cuenta tus propias visitas.',
      ],
    },
    {
      id: 'terceros',
      title: 'Servicios de terceros',
      paragraphs: [
        'Para funcionar, el sitio usa otros servicios. Al hacerlo, tu navegador les comunica tu dirección IP, como ocurre en cualquier página web:',
      ],
      items: [
        'Vercel, donde está alojado el sitio.',
        'Supabase, donde se guardan las cuentas, los anuncios, sus fotos y los reportes.',
        'Resend, que entrega los correos: los de tu cuenta y los datos que envías a quien publicó un anuncio.',
        'Cloudflare Turnstile, que comprueba que quien inicia sesión, se registra o contacta a un publicador no es un programa automático.',
        'Mapbox, que dibuja los mapas: recibe la zona del mapa que se está viendo.',
        'OpenStreetMap, de donde salen los datos de los mapas. Al buscar una dirección para publicar se le envían la colonia, la ciudad y el departamento; nunca la calle ni el número de la casa.',
        'Unsplash, de donde vienen las fotos de la portada y de los anuncios de ejemplo.',
        'Google Maps, solo si pulsas «Cómo llegar»: recibe el punto de la propiedad para trazar la ruta.',
        'WhatsApp, solo si eliges escribir a quien publica o compartir una ficha por ese medio.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      paragraphs: [
        `${BRAND.name} no usa cookies de publicidad ni para medir las visitas. Tu sesión se guarda en tu navegador para que no tengas que entrar cada vez.`,
      ],
    },
    {
      id: 'borrar',
      title: 'Cómo borrar tus datos',
      paragraphs: [
        'Puedes eliminar tus anuncios, con sus fotos, desde «Mis publicaciones», y corregir tu nombre y tu teléfono desde «Mi cuenta». Para eliminar tu cuenta, escríbenos o llámanos.',
      ],
    },
    {
      id: 'futuro',
      title: 'Cambios en esta política',
      paragraphs: [
        'Si cambia qué datos guardamos o a quién se los enviamos, actualizaremos esta política antes de hacerlo, con la fecha de la última revisión.',
      ],
    },
    {
      id: 'contacto',
      title: 'Contacto',
      paragraphs: [`Si tienes dudas sobre tus datos, llámanos al ${CONTACT.phone.display}.`],
    },
  ],
}
