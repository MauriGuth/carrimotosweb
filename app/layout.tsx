import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFlotante from '@/components/WhatsAppFlotante';
import { categoriasConConteo, marcasConConteo } from '@/lib/catalogo';
import { NEGOCIO, SITIO_INDEXABLE } from '@/data/sucursales';

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display-src',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans-src',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(NEGOCIO.sitio),
  title: {
    default: 'CARRI Motos — Concesionario de motos 0km',
    template: '%s | CARRI Motos',
  },
  description: NEGOCIO.descripcionCorta,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'CARRI Motos',
    title: 'CARRI Motos — Concesionario de motos 0km',
    description: NEGOCIO.descripcionCorta,
  },
  // Mientras falten los WhatsApp el sitio se publica con noindex. Se deja
  // entrar al robot igual (robots.txt no bloquea) porque si no pudiera leer
  // esta etiqueta, Google podría indexar la URL de todos modos.
  robots: SITIO_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#08080a',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categorias, marcas] = await Promise.all([categoriasConConteo(), marcasConConteo()]);

  return (
    <html lang="es-AR" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-carri focus:px-4 focus:py-2 focus:text-white"
        >
          Ir al contenido
        </a>
        <Header categorias={categorias} marcas={marcas} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer categorias={categorias} />
        <WhatsAppFlotante />
      </body>
    </html>
  );
}
