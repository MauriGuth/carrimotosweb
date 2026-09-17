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
  'honda-wave110-c-d-ym26': {
    fuera: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    motivo: 'marca de agua de UNO MOTOS; quedan las 7 de prensa de Honda',
  },
};
