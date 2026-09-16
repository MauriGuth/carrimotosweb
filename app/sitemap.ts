import type { MetadataRoute } from 'next';
import { MOTOS } from '@/data/motos';
import { NEGOCIO } from '@/data/sucursales';
import { categoriasConConteo, marcasConConteo, slugMarca } from '@/lib/catalogo';

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  const fijas = ['', '/catalogo', '/accesorios', '/sucursales'].map((ruta) => ({
    url: `${NEGOCIO.sitio}${ruta}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: ruta === '' ? 1 : 0.8,
  }));

  // Una página por marca y por categoría: son entradas naturales desde Google
  // ("motos honda", "motos enduro").
  const porMarca = marcasConConteo().map(({ marca }) => ({
    url: `${NEGOCIO.sitio}/catalogo/marca/${slugMarca(marca)}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const porCategoria = categoriasConConteo().map((c) => ({
    url: `${NEGOCIO.sitio}/catalogo/categoria/${c.slug}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const fichas = MOTOS.map((m) => ({
    url: `${NEGOCIO.sitio}/moto/${m.slug}`,
    lastModified: ahora,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...fijas, ...porMarca, ...porCategoria, ...fichas];
}
