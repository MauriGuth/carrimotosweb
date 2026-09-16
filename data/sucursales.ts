/**
 * ──────────────────────────────────────────────────────────────────────────
 *  SUCURSALES Y VENDEDORES
 *  Este es el único archivo que hay que tocar para cambiar los datos de
 *  contacto: nombres, números de WhatsApp, direcciones y horarios.
 *
 *  ⚠️ PENDIENTE: los teléfonos, direcciones y nombres de abajo son de EJEMPLO.
 *     Reemplazalos por los reales antes de publicar.
 *
 *  El teléfono va en formato internacional, sin "+" ni espacios ni guiones:
 *     +54 9 280 412-3456   →   "5492804123456"
 * ──────────────────────────────────────────────────────────────────────────
 */

export type Sucursal = {
  slug: string;
  /** Nombre de la sucursal, como lo conoce el cliente. */
  nombre: string;
  /** Persona que atiende ese WhatsApp. */
  vendedor: string;
  /** Teléfono en formato internacional sin símbolos, para el link de wa.me. */
  whatsapp: string;
  /** Cómo se muestra el teléfono en pantalla. */
  telefonoVisible: string;
  direccion: string;
  ciudad: string;
  horarios: string;
  /** Link a Google Maps (opcional). */
  mapsUrl?: string;
};

export const SUCURSALES: Sucursal[] = [
  {
    slug: 'casa-central',
    nombre: 'Casa Central',
    vendedor: 'Vendedor 1',
    whatsapp: '5490000000001',
    telefonoVisible: '+54 9 000 000-0001',
    direccion: 'Dirección de la sucursal 1',
    ciudad: 'Ciudad',
    horarios: 'Lunes a viernes de 9 a 13 y de 16 a 20 · Sábados de 9 a 13',
  },
  {
    slug: 'sucursal-2',
    nombre: 'Sucursal 2',
    vendedor: 'Vendedor 2',
    whatsapp: '5490000000002',
    telefonoVisible: '+54 9 000 000-0002',
    direccion: 'Dirección de la sucursal 2',
    ciudad: 'Ciudad',
    horarios: 'Lunes a viernes de 9 a 13 y de 16 a 20 · Sábados de 9 a 13',
  },
  {
    slug: 'sucursal-3',
    nombre: 'Sucursal 3',
    vendedor: 'Vendedor 3',
    whatsapp: '5490000000003',
    telefonoVisible: '+54 9 000 000-0003',
    direccion: 'Dirección de la sucursal 3',
    ciudad: 'Ciudad',
    horarios: 'Lunes a viernes de 9 a 13 y de 16 a 20 · Sábados de 9 a 13',
  },
];

/** Datos generales del negocio, usados en el pie y en los metadatos. */
export const NEGOCIO = {
  nombre: 'CARRI Motos',
  descripcionCorta: 'Concesionario oficial de motos 0km. Todas las marcas, financiación y service.',
  instagram: 'https://www.instagram.com/carrimotos',
  facebook: 'https://www.facebook.com/carrimotos',
  email: 'ventas@carrimotos.com.ar',
  /** Dominio donde se publica el sitio, para los metadatos y el sitemap. */
  sitio: 'https://www.carrimotos.com.ar',
};
