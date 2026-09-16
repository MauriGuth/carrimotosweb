// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run fotos  (lee public/motos/)

/** Fotos de cada modelo, en orden. La primera es la que va en la tarjeta. */
export const FOTOS: Record<string, string[]> = {

};

/** Fotos de un modelo. Array vacío si todavía no tiene ninguna cargada. */
export function fotosDe(slug: string): string[] {
  return FOTOS[slug] ?? [];
}
