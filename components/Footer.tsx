import Link from 'next/link';
import Logo from './Logo';
import IconoWhatsApp from './IconoWhatsApp';
import IconoInstagram from './IconoInstagram';
import { contactoDe, linkInstagram, NEGOCIO, SUCURSALES } from '@/data/sucursales';
import { consultaGeneral } from '@/lib/whatsapp';
import type { CategoriaSlug } from '@/data/motos';

type Props = {
  categorias: { slug: CategoriaSlug; nombre: string }[];
};

export default function Footer({ categorias }: Props) {
  return (
    <footer className="mt-20 border-t border-ink-700 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo className="h-14 w-auto text-mist-50" />
          <p className="mt-4 max-w-xs text-sm text-mist-400">{NEGOCIO.descripcionCorta}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={NEGOCIO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de CARRI Motos"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink-700 text-mist-400 transition-colors hover:border-carri hover:text-carri"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.71-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0" />
              </svg>
            </a>
          </div>
        </div>

        <nav className="text-sm">
          <p className="titulo mb-4 text-xs tracking-widest text-mist-500">Catálogo</p>
          <ul className="space-y-2.5">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo/categoria/${c.slug}`} className="text-mist-300 transition-colors hover:text-carri">
                  {c.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/accesorios" className="text-mist-300 transition-colors hover:text-carri">
                Accesorios
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm lg:col-span-2">
          <p className="titulo mb-4 text-xs tracking-widest text-mist-500">Nuestras sucursales</p>
          <ul className="grid gap-4 sm:grid-cols-3">
            {SUCURSALES.map((s) => {
              const canal = consultaGeneral(s);
              return (
                <li key={s.slug}>
                  <p className="font-semibold text-mist-50">{s.nombre}</p>
                  {s.direccion && <p className="mt-1 text-mist-400">{s.direccion}</p>}
                  {s.ciudad && <p className="text-mist-400">{s.ciudad}</p>}

                  <div className="mt-2 flex flex-col items-start gap-1.5">
                    {/* Sin número cargado, consultaGeneral cae en Instagram y el
                        link de abajo ya es ese: no se repite. */}
                    {canal.tipo === 'whatsapp' && (
                      <a
                        href={canal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp de ${s.nombre}`}
                        className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                        style={{ color: '#25D366' }}
                      >
                        <IconoWhatsApp className="h-3.5 w-3.5" />
                        <span>{contactoDe(s)}</span>
                      </a>
                    )}

                    <a
                      href={linkInstagram(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Instagram de ${s.nombre}`}
                      className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                      style={{ color: '#E1306C' }}
                    >
                      <IconoInstagram className="h-3.5 w-3.5" />
                      <span>@{s.instagram}</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-mist-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {NEGOCIO.nombre}. Todos los derechos reservados.
          </p>
          <p>Las imágenes y características son ilustrativas. Consultá disponibilidad y precio por WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}
