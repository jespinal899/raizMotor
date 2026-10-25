/**
 * Safari en el iPhone y el iPad amplía la página al tocar un campo si su letra se ve por debajo de 16 px. Los
 * campos ya miden 16 px, pero el tamaño de página de Safari («aA») o el texto del sistema pueden achicarlos.
 * Con `maximum-scale=1` Safari deja de ampliar al escribir y se sigue pudiendo ampliar con dos dedos. Solo en
 * iOS: en Android ese valor sí bloquearía el zoom con los dedos.
 */
export const preventIosInputZoom = (nav: Navigator = navigator, doc: Document = document) => {
  // El iPad con iPadOS se presenta como un Mac, pero con pantalla táctil.
  const isIos = /iPhone|iPad|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
  const viewport = doc.querySelector<HTMLMetaElement>('meta[name="viewport"]')
  if (!isIos || !viewport || viewport.content.includes('maximum-scale')) return

  viewport.content = `${viewport.content}, maximum-scale=1`
}
