/**
 * ──────────────────────────────────────────────────────────────────────────
 *  SUCURSALES
 *  Este es el único archivo que hay que tocar para cambiar los datos de
 *  contacto: nombres, WhatsApp, Instagram, direcciones y horarios.
 *
 *  Los tres WhatsApp están cargados. Si a alguna sucursal se le vacía el
 *  número, sus botones de contacto vuelven a usar Instagram en vez de quedar
 *  rotos — y el sitio vuelve a publicarse con noindex (ver SITIO_INDEXABLE).
 *
 *  ⚠️ FALTAN los horarios de atención. Los campos vacíos simplemente no se
 *     muestran: no hay datos de relleno dando vueltas en la web.
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
    slug: 'centenario',
    nombre: 'Centenario',
    instagram: 'carrimotos.centenario',
    whatsapp: '5492995338783',
    telefonoVisible: '+54 9 2995 33-8783',
    direccion: 'San Martín 279',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=San%20Mart%C3%ADn%20279%2C%20Centenario%2C%20Neuqu%C3%A9n%2C%20Argentina',
    ciudad: 'Centenario, Neuquén',
  },
  {
    slug: 'plottier',
    nombre: 'Plottier',
    instagram: 'carrimotos.plottier',
    whatsapp: '5492993295118',
    telefonoVisible: '+54 9 2993 29-5118',
    direccion: 'Av. San Martín 853',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Av.%20San%20Mart%C3%ADn%20853%2C%20Plottier%2C%20Neuqu%C3%A9n%2C%20Argentina',
    ciudad: 'Plottier, Neuquén',
  },
  {
    slug: 'san-martin-de-los-andes',
    nombre: 'San Martín de los Andes',
    instagram: 'carrimotos.patagonia',
    whatsapp: '5492972415844',
    telefonoVisible: '+54 9 2972 41-5844',
    direccion: 'Av. San Martín 1378',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Av.%20San%20Mart%C3%ADn%201378%2C%20San%20Mart%C3%ADn%20de%20los%20Andes%2C%20Neuqu%C3%A9n%2C%20Argentina',
    ciudad: 'San Martín de los Andes, Neuquén',
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

/**
 * ¿El sitio se puede indexar en Google?
 *
 * Mientras alguna sucursal no tenga su WhatsApp cargado, el sitio se publica
 * con `noindex`: sirve para mostrarlo y compartir el link, pero no aparece en
 * las búsquedas. No tiene sentido que Google indexe un catálogo cuyo botón de
 * contacto todavía no lleva al teléfono real.
 *
 * Se calcula solo: en cuanto los tres números estén en SUCURSALES, el sitio
 * pasa a ser indexable en el siguiente deploy. No hay ningún interruptor que
 * acordarse de volver a prender.
 */
export const SITIO_INDEXABLE: boolean = SUCURSALES.every((s) => Boolean(s.whatsapp));

/** Datos generales del negocio, usados en el pie y en los metadatos. */
export const NEGOCIO = {
  nombre: 'CARRI Motos',
  descripcionCorta: 'Concesionario de motos 0km. Todas las marcas, financiación y service.',
  /** Cuenta principal del negocio. */
  instagram: 'https://www.instagram.com/carrimotos.centenario/',
  email: '',
  /** Dominio donde se publica el sitio, para los metadatos y el sitemap. */
  sitio: 'https://carrimotos.com.ar',
};
