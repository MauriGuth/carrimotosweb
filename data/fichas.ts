// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run import:catalogo  (fuente: scripts/catalogo.xlsx)

import type { FichaTecnica } from './campos-ficha';

/** Ficha técnica de cada modelo. Los modelos que no están acá no tienen ficha cargada. */
export const FICHAS: Record<string, FichaTecnica> = {
  "gilera-sahel-150": {
    motor: "Monocilíndrico 4T",
    refrigeracion: "Por aire",
    alimentacion: "Carburador",
    cilindrada: "149 cc",
    potencia: "10.7 hp a 8500 rpm",
    transmision: "Manual, 5 velocidades",
    arranque: "Eléctrico y patada",
    frenoDelantero: "Disco",
    frenoTrasero: "Tambor",
    rodadoDelantero: "90/90-19",
    rodadoTrasero: "110/90-17",
    tanque: "8.6 L",
    peso: "120 kg",
    largo: "2060 mm",
    ancho: "870 mm",
    alto: "1170 mm",
    alarma: "No incluye",
    garantia: "12 meses o 12.000 km",
    equipamiento: "Full LED / USB / Tablero digital",
  },
};

/** Ficha de un modelo, o un objeto vacío si todavía no se cargó. */
export function fichaDe(slug: string): FichaTecnica {
  return FICHAS[slug] ?? {};
}
