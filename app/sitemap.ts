import type { MetadataRoute } from 'next';
import { NEGOCIO, SITIO_INDEXABLE } from '@/data/sucursales';
import { categoriasConConteo, marcasConConteo, todasLasMotos } from '@/lib/catalogo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mientras el sitio esté en noindex no se listan páginas: sería pedirle a
  // Google que rastree justo lo que le estamos diciendo que no indexe.
  if (!SITIO_INDEXABLE) return [];

  const ahora = new Date();
  const [motos, marcas, categorias] = await Promise.all([
    todasLasMotos(),
    marcasConConteo(),
    categoriasConConteo(),
  ]);

  const fijas = ['', '/catalogo', '/accesorios', '/sucursales'].map((ruta) => ({
    url: `${NEGOCIO.sitio}${ruta}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: ruta === '' ? 1 : 0.8,
  }));

  // Una página por marca y por categoría: son entradas naturales desde Google
  // ("motos honda", "motos enduro").
  const porMarca = marcas.map(({ slug }) => ({
    url: `${NEGOCIO.sitio}/catalogo/marca/${slug}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const porCategoria = categorias.map((c) => ({
    url: `${NEGOCIO.sitio}/catalogo/categoria/${c.slug}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const fichas = motos.map((m) => ({
    url: `${NEGOCIO.sitio}/moto/${m.slug}`,
    lastModified: ahora,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...fijas, ...porMarca, ...porCategoria, ...fichas];
}
