// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run fotos  (lee public/motos/)

/**
 * Una foto del catálogo. `grande` es la de 1200x900 para la ficha;
 * `mini` es la de 400x300 para las tarjetas y las miniaturas.
 */
export type Foto = { grande: string; mini: string };

/** Fotos de cada modelo, en orden. La primera es la que va en la tarjeta. */
export const FOTOS: Record<string, Foto[]> = {
  "gilera-sahel-150": [
    { grande: "/motos/gilera-sahel-150/1.jpg", mini: "/motos/gilera-sahel-150/mini/1.jpg" },
    { grande: "/motos/gilera-sahel-150/2.jpg", mini: "/motos/gilera-sahel-150/mini/2.jpg" },
    { grande: "/motos/gilera-sahel-150/3.jpg", mini: "/motos/gilera-sahel-150/mini/3.jpg" },
    { grande: "/motos/gilera-sahel-150/4.jpg", mini: "/motos/gilera-sahel-150/mini/4.jpg" },
    { grande: "/motos/gilera-sahel-150/5.jpg", mini: "/motos/gilera-sahel-150/mini/5.jpg" },
    { grande: "/motos/gilera-sahel-150/6.jpg", mini: "/motos/gilera-sahel-150/mini/6.jpg" },
    { grande: "/motos/gilera-sahel-150/7.jpg", mini: "/motos/gilera-sahel-150/mini/7.jpg" },
    { grande: "/motos/gilera-sahel-150/8.jpg", mini: "/motos/gilera-sahel-150/mini/8.jpg" },
    { grande: "/motos/gilera-sahel-150/9.jpg", mini: "/motos/gilera-sahel-150/mini/9.jpg" },
    { grande: "/motos/gilera-sahel-150/10.jpg", mini: "/motos/gilera-sahel-150/mini/10.jpg" },
    { grande: "/motos/gilera-sahel-150/11.jpg", mini: "/motos/gilera-sahel-150/mini/11.jpg" },
    { grande: "/motos/gilera-sahel-150/12.jpg", mini: "/motos/gilera-sahel-150/mini/12.jpg" },
    { grande: "/motos/gilera-sahel-150/13.jpg", mini: "/motos/gilera-sahel-150/mini/13.jpg" },
    { grande: "/motos/gilera-sahel-150/14.jpg", mini: "/motos/gilera-sahel-150/mini/14.jpg" },
    { grande: "/motos/gilera-sahel-150/15.jpg", mini: "/motos/gilera-sahel-150/mini/15.jpg" },
    { grande: "/motos/gilera-sahel-150/16.jpg", mini: "/motos/gilera-sahel-150/mini/16.jpg" },
    { grande: "/motos/gilera-sahel-150/17.jpg", mini: "/motos/gilera-sahel-150/mini/17.jpg" },
    { grande: "/motos/gilera-sahel-150/18.jpg", mini: "/motos/gilera-sahel-150/mini/18.jpg" },
    { grande: "/motos/gilera-sahel-150/19.jpg", mini: "/motos/gilera-sahel-150/mini/19.jpg" },
    { grande: "/motos/gilera-sahel-150/20.jpg", mini: "/motos/gilera-sahel-150/mini/20.jpg" },
  ],
};

/** Fotos de un modelo. Array vacío si todavía no tiene ninguna cargada. */
export function fotosDe(slug: string): Foto[] {
  return FOTOS[slug] ?? [];
}
