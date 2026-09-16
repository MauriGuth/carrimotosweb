import type { MetadataRoute } from 'next';
import { NEGOCIO } from '@/data/sucursales';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${NEGOCIO.sitio}/sitemap.xml`,
  };
}
