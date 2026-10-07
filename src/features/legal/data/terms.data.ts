import type { LegalDocumentContent } from '@/features/legal/types/legal.types'
import { BRAND } from '@/shared/constants/brand'
import { CONTACT } from '@/shared/constants/contact'
import { EXCHANGE_RATE } from '@/shared/constants/currency'
import { ROUTES } from '@/shared/constants/routes'
import { formatLongDate } from '@/shared/utils/format'

/**
 * Términos y condiciones. Describen el sitio tal como funciona hoy; es un texto preliminar que debe
 * revisarse con un abogado antes del lanzamiento, y la página lo dice.
 */
export const TERMS: LegalDocumentContent = {
  title: 'Términos y condiciones',
  summary: `Las reglas para usar ${BRAND.name}, dichas en claro.`,
  updatedOn: '2026-10-06',
  related: { label: 'Leer la política de privacidad', to: ROUTES.privacy },
  sections: [
    {
      id: 'que-es',
      title: `Qué es ${BRAND.name}`,
      paragraphs: [
        `${BRAND.name} es una plataforma de anuncios inmobiliarios de Honduras: reúne casas, apartamentos y terrenos para que quien los ofrece y quien los busca se encuentren.`,
        `${BRAND.name} no es dueño de las propiedades anunciadas ni participa en su venta o alquiler. El acuerdo es siempre entre el anunciante y la persona interesada.`,
      ],
    },
    {
      id: 'en-desarrollo',
      title: 'El sitio está en desarrollo',
      paragraphs: ['Hoy el sitio es una versión de demostración. Esto es lo que debes saber antes de usarlo:'],
      items: [
        'Los anuncios que publican «Inmobiliaria de ejemplo», «Propietario de ejemplo» y «Constructora de ejemplo» son de muestra: no corresponden a propiedades reales.',
        'Un anuncio publicado desde este sitio se guarda solo en el navegador de quien lo publica. Otras personas todavía no pueden verlo.',
        'El registro, el inicio de sesión, los mensajes de contacto, las cotizaciones y los reportes todavía no se envían a ningún servidor. Cuando intentas usarlos, el sitio te avisa de que no se envió nada.',
      ],
    },
    {
      id: 'publicar',
      title: 'Publicar un anuncio',
      paragraphs: ['Al publicar un anuncio te comprometes a que:'],
      items: [
        'Tienes derecho a ofrecer la propiedad, como propietario o con su autorización.',
        'Los datos, el precio y las fotos son verdaderos y corresponden a esa propiedad.',
        'Las fotos son tuyas o tienes permiso para usarlas.',
        'El anuncio no incluye contenido ilegal, ofensivo ni engañoso.',
      ],
    },
    {
      id: 'precios',
      title: 'Precios y moneda',
      paragraphs: [
        `Los precios se publican en dólares de los Estados Unidos. Junto a cada precio se muestra su equivalente aproximado en lempiras, calculado con el tipo de cambio de referencia del Banco Central de Honduras: L ${EXCHANGE_RATE.lempirasPerDollar} por $ 1, del ${formatLongDate(EXCHANGE_RATE.asOf)}.`,
        'Ese importe es orientativo. El precio que vale es el que acuerdes con el anunciante.',
      ],
    },
    {
      id: 'cotizaciones',
      title: 'Cotizaciones y contacto',
      paragraphs: [
        'Al pedir una cotización o escribir a un anunciante das tu nombre, tu correo y tu teléfono para que puedan responderte sobre esa propiedad.',
        'Una cotización es una estimación: no es una oferta ni obliga a ninguna de las partes.',
      ],
    },
    {
      id: 'seguridad',
      title: 'Tu seguridad',
      paragraphs: [`${BRAND.name} no visita ni verifica cada propiedad anunciada. Antes de pagar o de firmar:`],
      items: [
        'Visita la propiedad.',
        'Comprueba quién es el propietario y pide ver la escritura o el contrato.',
        'Desconfía de quien pida dinero por adelantado sin mostrar la propiedad.',
        'Si un anuncio te parece falso o fraudulento, repórtalo desde su ficha.',
      ],
    },
    {
      id: 'responsabilidad',
      title: 'Responsabilidad',
      paragraphs: [
        `${BRAND.name} ofrece el sitio tal como está. No garantiza que los anuncios sean exactos ni que una propiedad siga disponible, y no responde por los acuerdos, los pagos o los daños que resulten del trato entre anunciantes e interesados.`,
        'Podremos retirar los anuncios que incumplan estos términos.',
      ],
    },
    {
      id: 'cambios',
      title: 'Cambios en estos términos',
      paragraphs: [
        'Estos términos pueden cambiar a medida que el sitio avance. La fecha de arriba dice cuándo se revisaron por última vez.',
      ],
    },
    {
      id: 'contacto',
      title: 'Contacto',
      paragraphs: [`Si tienes dudas sobre estos términos, llámanos al ${CONTACT.phone.display}.`],
    },
  ],
}
