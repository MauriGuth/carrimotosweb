import type { MetadataRoute } from 'next';
import { NEGOCIO, SITIO_INDEXABLE } from '@/data/sucursales';
import { categoriasConConteo, marcasConConteo, promosVigentes, todasLasMotos } from '@/lib/catalogo';

/**
 * El catálogo sale de Nova y el cliente lo edita desde el panel, así que esta
 * página se vuelve a generar cada minuto.
 *
 * Tiene que estar acá, en la página: el `revalidate` del fetch de lib/catalogo
 * NO alcanza. Sin este export Next la prerenderiza y la deja estática para
 * siempre, y lo que el cliente cambia en Nova recién se ve en el próximo
 * deploy. (Se vio en producción: una foto nueva no aparecía nunca.)
 */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mientras el sitio esté en noindex no se listan páginas: sería pedirle a
  // Google que rastree justo lo que le estamos diciendo que no indexe.
  if (!SITIO_INDEXABLE) return [];

  const ahora = new Date();
  const [motos, marcas, categorias, promos] = await Promise.all([
    todasLasMotos(),
    marcasConConteo(),
    categoriasConConteo(),
    promosVigentes(),
  ]);

  const fijas = ['', '/catalogo', '/promos', '/accesorios', '/sucursales'].map((ruta) => ({
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

  // Las promos cambian seguido y vencen: se listan a diario para que Google
  // no siga mostrando una que ya no está.
  const dePromos = promos.map((p) => ({
    url: `${NEGOCIO.sitio}/promos/${p.slug}`,
    lastModified: ahora,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...fijas, ...dePromos, ...porMarca, ...porCategoria, ...fichas];
}
