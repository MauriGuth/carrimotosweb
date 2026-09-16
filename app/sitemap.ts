import type { MetadataRoute } from 'next';
import { MOTOS } from '@/data/motos';
import { NEGOCIO } from '@/data/sucursales';

export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ['', '/catalogo', '/accesorios', '/sucursales'].map((ruta) => ({
    url: `${NEGOCIO.sitio}${ruta}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: ruta === '' ? 1 : 0.8,
  }));

  const fichas = MOTOS.map((m) => ({
    url: `${NEGOCIO.sitio}/moto/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...fijas, ...fichas];
}
