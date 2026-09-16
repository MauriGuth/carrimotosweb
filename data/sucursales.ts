/**
 * ──────────────────────────────────────────────────────────────────────────
 *  SUCURSALES
 *  Este es el único archivo que hay que tocar para cambiar los datos de
 *  contacto: nombres, WhatsApp, Instagram, direcciones y horarios.
 *
 *  ⚠️ FALTA CARGAR: los tres números de WhatsApp, las direcciones y los
 *     horarios. Mientras `whatsapp` esté vacío, los botones de contacto de
 *     esa sucursal usan su Instagram, que sí funciona. Apenas cargues el
 *     número, WhatsApp pasa a tener prioridad automáticamente.
 *
 *     Los campos de dirección y horarios vacíos simplemente no se muestran:
 *     no hay datos de relleno dando vueltas en la web.
 *
 *  El teléfono va en formato internacional, sin "+" ni espacios ni guiones:
 *     +54 9 299 412-3456   →   "5492994123456"
 * ──────────────────────────────────────────────────────────────────────────
 */

export type Sucursal = {
  slug: string;
  /** Nombre de la sucursal, como la conoce el cliente. */
  nombre: string;
  /** Usuario de Instagram, sin la arroba. */
  instagram: string;
  /**
   * Persona que atiende ese WhatsApp. Si se deja vacío, los botones usan el
   * nombre de la sucursal ("Escribir a Centenario").
   */
  vendedor?: string;
  /** Teléfono en formato internacional sin símbolos. Vacío = todavía no cargado. */
  whatsapp?: string;
  /** Cómo se muestra el teléfono en pantalla. */
  telefonoVisible?: string;
  direccion?: string;
  ciudad?: string;
  horarios?: string;
  /** Link a Google Maps (opcional). */
  mapsUrl?: string;
};

export const SUCURSALES: Sucursal[] = [
  {
    slug: 'casa-central',
    nombre: 'Casa Central',
    instagram: 'carrimotos.patagonia',
  },
  {
    slug: 'centenario',
    nombre: 'Centenario',
    instagram: 'carrimotos.centenario',
    ciudad: 'Centenario',
  },
  {
    slug: 'plottier',
    nombre: 'Plottier',
    instagram: 'carrimotos.plottier',
    ciudad: 'Plottier',
  },
];

/** Nombre con el que se le habla al cliente en los botones de contacto. */
export function contactoDe(sucursal: Sucursal): string {
  return sucursal.vendedor ?? sucursal.nombre;
}

/** Link al perfil de Instagram de la sucursal. */
export function linkInstagram(sucursal: Sucursal): string {
  return `https://www.instagram.com/${sucursal.instagram}/`;
}

/** Datos generales del negocio, usados en el pie y en los metadatos. */
export const NEGOCIO = {
  nombre: 'CARRI Motos',
  descripcionCorta: 'Concesionario de motos 0km. Todas las marcas, financiación y service.',
  /** Cuenta principal, la de Casa Central. */
  instagram: 'https://www.instagram.com/carrimotos.patagonia/',
  email: '',
  /** Dominio donde se publica el sitio, para los metadatos y el sitemap. */
  sitio: 'https://carrimotos.com.ar',
};
