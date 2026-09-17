/**
 * Orden de las fotos dentro de la galería de cada modelo.
 *
 * Los zips de los importadores vienen numerados como salieron del estudio, y
 * ese orden mezcla primeros planos (el tablero, el motor, una llanta) entre
 * las fotos de la moto entera. En la web conviene al revés: primero la moto
 * completa —la número 1 es, además, la que sale en la tarjeta del catálogo— y
 * los detalles al final.
 *
 * Cada lista dice en qué orden van las fotos que `npm run fotos` dejó en
 * public/motos/<slug>/, usando los números de archivo que generó. O sea:
 * [3, 1, 2] significa "primero la 3, después la 1, después la 2".
 *
 * Para armar una lista nueva: corré `npm run fotos`, mirá las fotos que quedaron
 * en public/motos/<slug>/ y anotá el orden que querés. Si la lista no cubre
 * exactamente las fotos que hay, el script avisa y deja el orden original, así
 * que un zip que cambió nunca queda mal ordenado en silencio.
 *
 * Un modelo sin entrada acá se queda con el orden del zip, que suele estar bien.
 */
export const ORDEN_FOTOS: Record<string, number[]> = {
  // Recortes sobre blanco, después la moto entera en la calle, y al final el
  // tablero, el tanque, el motor y los puños.
  'bajaj-dominar-400-tourer': [1, 2, 3, 12, 15, 14, 11, 9, 10, 13, 4, 5, 6, 7, 8],

  // Los cuatro colores de estudio, la pista, y el primer plano del piloto último.
  'bajaj-ns-400-nueva': [1, 2, 3, 4, 5, 7, 6],

  // Estudio, moto entera en la calle, y al final tablero, motor y tanque.
  'bajaj-rouser-n-250': [1, 2, 3, 4, 9, 11, 8, 10, 5, 6, 7],

  // Estudio y después las de calle; la última es más de la persona que de la moto.
  'bajaj-rouser-ns-200': [1, 2, 3, 4, 8, 9, 5, 6, 7],

  // Estudio, las de calle, y al final tanque, motor y llanta.
  'bajaj-rouserns-125': [1, 5, 7, 6, 8, 2, 3, 4],
};
