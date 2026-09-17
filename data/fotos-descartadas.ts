/**
 * Fotos que llegaron en un zip y NO se publican.
 *
 * El caso real y el motivo por el que existe este archivo: varios zips traen
 * mezcladas fotos sacadas en el local de UNO MOTOS, con su marca de agua
 * encima y en algunas su teléfono. Publicarlas sería ponerle el contacto de
 * la competencia al catálogo propio. Se descartan esas y quedan las de prensa
 * de la marca, que vienen en el mismo zip más atrás.
 *
 * Los números son la posición de la foto **en el zip**, que es el orden por
 * nombre de archivo. Se descartan antes de aplicar data/orden-fotos.ts, así
 * que si un modelo tiene las dos cosas, el orden se cuenta sobre las que
 * quedaron.
 *
 * Si el importador manda el zip limpio, se saca la entrada de acá y las fotos
 * vuelven solas en el siguiente `npm run fotos`.
 */
export type Descarte = {
  /** Posiciones en el zip, empezando en 1. */
  fuera: number[];
  motivo: string;
};

export const DESCARTADAS: Record<string, Descarte> = {
  'honda-cb125-f-twister-2026': {
    fuera: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    motivo: 'marca de agua de UNO MOTOS; quedan las 10 de prensa de Honda',
  },
  'honda-wave-110': {
    fuera: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    motivo: 'marca de agua de UNO MOTOS; quedan las 6 de prensa de Honda',
  },
  'zanella-zr-150-lte': {
    // Las 25 tienen el logo y el teléfono de UNO MOTOS impresos arriba, en
    // grande. No se salva ninguna.
    fuera: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
      14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    ],
    motivo: 'el zip entero es de UNO MOTOS; hay que pedirle las fotos a ZANELLA',
  },
  'tvs-rtr-200': {
    fuera: [17, 18, 19, 20, 21, 22, 23, 24, 25],
    motivo: 'marca de agua de UNO MOTOS; quedan las 16 del salón',
  },
  'tvs-rtr-200-f1': {
    fuera: [20, 21, 22, 23, 24, 25],
    motivo: 'marca de agua de UNO MOTOS; quedan las 19 del salón',
  },
  'keeway-target': {
    // Las nueve son de la vereda de UNO MOTOS, con su cartel de fondo. La
    // última ni siquiera es una foto: es el cartel de la publicación de ellos,
    // y describe una unidad puntual de 2017 con detalles estéticos que además
    // no es stock nuestro.
    fuera: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    motivo: 'el zip entero es del local de UNO MOTOS; hay que pedirle las fotos a KEEWAY',
  },
  'honda-wave110-c-d-ym26': {
    fuera: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    motivo: 'marca de agua de UNO MOTOS; quedan las 7 de prensa de Honda',
  },
};
