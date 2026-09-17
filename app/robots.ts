import type { MetadataRoute } from 'next';
import { NEGOCIO, SITIO_INDEXABLE } from '@/data/sucursales';

export default function robots(): MetadataRoute.Robots {
  if (!SITIO_INDEXABLE) {
    // Queda escrito en el log del build de Vercel, para que no pase inadvertido.
    console.warn(
      '\n  ⚠  El sitio se publica con NOINDEX: falta cargar algún WhatsApp en data/sucursales.ts.\n' +
        '     Se reactiva solo en cuanto estén los tres números.\n',
    );
  }

  // Se permite el rastreo siempre, también cuando el sitio está en noindex:
  // un Disallow impediría que el robot leyera la etiqueta noindex y la URL
  // podría terminar indexada igual, sin descripción. Lo que se saca mientras
  // tanto es el sitemap, para no ofrecerle páginas que no queremos indexadas.
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(SITIO_INDEXABLE ? { sitemap: `${NEGOCIO.sitio}/sitemap.xml` } : {}),
  };
}
