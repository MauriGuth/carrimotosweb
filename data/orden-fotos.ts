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

  // Los tres colores de perfil y de frente, la moto parada en la ruta, las de
  // andando —la 14 casi al final porque la moto se ve chiquita— y al final el
  // frente, el manillar, el tablero, el motor, la llanta y el escape.
  'benelli-trk-702': [
    1, 2, 3, 4, 5, 6,
    7, 11, 13,
    8, 10, 15, 12, 16, 22, 23, 25, 24, 14,
    9, 17, 19, 18, 20, 21,
  ],

  // El zip deja tres fotos de la moto entera al final (23, 24 y la 10), detrás
  // de los detalles: se suben con las de estudio.
  'benelli-trk-702-x': [
    1, 2, 3, 4, 5, 6, 7, 8,
    10, 23, 24, 14, 15,
    11, 12, 16, 17, 18, 19, 25, 13,
    9, 20, 21, 22,
  ],

  // ── CFMOTO ────────────────────────────────────────────────────────────
  // Las del salón primero; el resto son primeros planos del mismo lugar.
  'cfmoto-nk-650': [20, 1, 21, 11, 5, 18, 12, 16, 6, 19, 7, 17, 2, 13, 15, 4, 14, 3, 8, 9, 10],
  // Los dos recortes sobre blanco adelante, que en la tarjeta se ven mejor
  // que la foto contra la pared de ladrillos.
  'cfmoto-nk-300': [4, 5, 1, 7, 6, 13, 2, 3, 12, 8, 9, 11, 10],
  'cfmoto-nk-400': [6, 7, 8, 9, 3, 4, 5, 1, 2, 10, 13, 12, 11, 14, 15, 16],
  'cfmoto-mt-650': [1, 10, 11, 4, 2, 14, 6, 3, 13, 5, 7, 12, 8, 9],

  // ── CORVEN ────────────────────────────────────────────────────────────
  'corven-triax-150': [1, 2, 3, 4, 10, 5, 6, 8, 7, 9],

  // ── GILERA ────────────────────────────────────────────────────────────
  // Son fotos del salón y todas siguen el mismo patrón: la moto entera al
  // principio y al final, con los primeros planos en el medio. Se juntan las
  // de la moto entera arriba.
  'gilera-smx-200': [1, 2, 16, 17, 11, 6, 7, 14, 15, 3, 4, 5, 13, 9, 10, 8, 12],
  'gilera-smx-200-adventure': [1, 2, 15, 16, 11, 8, 9, 10, 13, 14, 3, 4, 5, 12, 6, 7],
  'gilera-vc-150-r-d': [1, 2, 3, 18, 19, 20, 4, 6, 12, 11, 7, 8, 9, 13, 10, 5, 14, 15, 16, 17],
  'gilera-ac-250-4v': [1, 2, 18, 19, 6, 12, 17, 15, 13, 3, 4, 16, 5, 14, 7, 8, 9, 10, 11],
  'gilera-smash-full-cbs': [1, 2, 3, 4, 19, 20, 21, 22, 15, 16, 10, 13, 9, 5, 6, 7, 8, 11, 12, 14, 17, 18],
  'gilera-smash-automatica': [1, 2, 3, 18, 19, 20, 14, 4, 17, 16, 6, 15, 7, 8, 9, 5, 10, 11, 12, 13],
  'gilera-smash-125-cbs': [1, 2, 20, 21, 17, 18, 16, 3, 4, 19, 5, 6, 7, 8, 13, 15, 14, 9, 10, 11, 12],
  'gilera-smash-vs-cbs': [1, 2, 18, 19, 17, 3, 15, 5, 16, 4, 6, 14, 11, 13, 12, 7, 9, 8, 10],
  'gilera-smash-r-full': [1, 2, 15, 3, 14, 13, 5, 12, 11, 4, 6, 7, 9, 10, 8],
};
