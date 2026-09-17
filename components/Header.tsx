'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import type { CategoriaSlug } from '@/data/motos';

type Props = {
  categorias: { slug: CategoriaSlug; nombre: string; total: number }[];
  marcas: { marca: string; slug: string; total: number }[];
};

const LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/accesorios', label: 'Accesorios' },
  { href: '/sucursales', label: 'Sucursales' },
];

export default function Header({ categorias, marcas }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [desplegable, setDesplegable] = useState<'categorias' | 'marcas' | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Al cambiar de página se cierra todo.
  useEffect(() => {
    setMenuAbierto(false);
    setDesplegable(null);
  }, [pathname]);

  // Cerrar los desplegables al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!desplegable) return;
    const alClic = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setDesplegable(null);
    };
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDesplegable(null);
    };
    document.addEventListener('mousedown', alClic);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClic);
      document.removeEventListener('keydown', alEscape);
    };
  }, [desplegable]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:gap-6 sm:px-6">
        <Link href="/" className="shrink-0 text-mist-50" aria-label="CARRI Motos — Inicio">
          <Logo className="h-9 w-auto sm:h-11" />
        </Link>

        <div ref={navRef} className="ml-auto hidden items-center gap-1 lg:flex">
          <Desplegable
            titulo="Motos por categoría"
            abierto={desplegable === 'categorias'}
            alAlternar={() => setDesplegable((d) => (d === 'categorias' ? null : 'categorias'))}
          >
            {categorias.map((c) => (
              <ItemDesplegable key={c.slug} href={`/catalogo/categoria/${c.slug}`} label={c.nombre} total={c.total} />
            ))}
          </Desplegable>

          <Desplegable
            titulo="Motos por marca"
            abierto={desplegable === 'marcas'}
            alAlternar={() => setDesplegable((d) => (d === 'marcas' ? null : 'marcas'))}
            columnas
          >
            {marcas.map((m) => (
              <ItemDesplegable
                key={m.marca}
                href={`/catalogo/marca/${m.slug}`}
                label={m.marca}
                total={m.total}
              />
            ))}
          </Desplegable>

          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`titulo rounded px-3 py-2 text-sm tracking-wide transition-colors hover:text-carri-hi ${
                pathname.startsWith(l.href) ? 'text-carri' : 'text-mist-200'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          className="ml-auto grid h-10 w-10 place-items-center rounded border border-ink-700 text-mist-200 lg:hidden"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {menuAbierto ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {menuAbierto && (
        <div id="menu-movil" className="border-t border-ink-700 bg-ink-900 lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="titulo block border-b border-ink-800 py-3 text-sm tracking-wide text-mist-100"
              >
                {l.label}
              </Link>
            ))}

            <p className="titulo mt-5 mb-2 text-xs tracking-widest text-mist-500">Por categoría</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalogo/categoria/${c.slug}`}
                  className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-mist-200"
                >
                  {c.nombre}
                </Link>
              ))}
            </div>

            <p className="titulo mt-5 mb-2 text-xs tracking-widest text-mist-500">Por marca</p>
            <div className="flex flex-wrap gap-2">
              {marcas.map((m) => (
                <Link
                  key={m.marca}
                  href={`/catalogo/marca/${m.slug}`}
                  className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-mist-200"
                >
                  {m.marca}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Desplegable({
  titulo,
  abierto,
  alAlternar,
  columnas = false,
  children,
}: {
  titulo: string;
  abierto: boolean;
  alAlternar: () => void;
  columnas?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={alAlternar}
        aria-expanded={abierto}
        className={`titulo flex items-center gap-1.5 rounded px-3 py-2 text-sm tracking-wide transition-colors hover:text-carri-hi ${
          abierto ? 'text-carri' : 'text-mist-200'
        }`}
      >
        {titulo}
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {abierto && (
        <div
          className={`absolute right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-ink-700 bg-ink-850 p-2 shadow-2xl shadow-black/60 ${
            columnas ? 'grid w-[34rem] grid-cols-3 gap-0.5' : 'w-64'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ItemDesplegable({ href, label, total }: { href: string; label: string; total: number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded px-3 py-2 text-sm text-mist-200 transition-colors hover:bg-ink-800 hover:text-mist-50"
    >
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-xs text-mist-500">{total}</span>
    </Link>
  );
}
