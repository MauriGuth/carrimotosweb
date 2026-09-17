import Link from 'next/link';
import CatalogoCliente from './CatalogoCliente';
import Revelar from './Revelar';
import type { CategoriaSlug } from '@/data/motos';
import { categoriasConConteo, marcasConConteo, todasLasMotos } from '@/lib/catalogo';

type Props = {
  titulo: string;
  bajada: string;
  filtroInicial?: { marca?: string; categoria?: CategoriaSlug };
  /** Migas de pan, cuando es una vista filtrada. */
  migas?: { etiqueta: string }[];
};

/**
 * Layout compartido por /catalogo y por las vistas filtradas por marca y por
 * categoría. Las tres se generan estáticas: el filtro llega como prop desde el
 * servidor, así el HTML ya sale con las motos que corresponden.
 */
export default async function VistaCatalogo({ titulo, bajada, filtroInicial, migas }: Props) {
  const [motos, categorias, marcas] = await Promise.all([
    todasLasMotos(),
    categoriasConConteo(),
    marcasConConteo(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      {migas && (
        <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-mist-500">
          <Link href="/" className="transition-colors hover:text-carri">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/catalogo" className="transition-colors hover:text-carri">
            Catálogo
          </Link>
          {migas.map((m) => (
            <span key={m.etiqueta} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <span className="text-mist-300">{m.etiqueta}</span>
            </span>
          ))}
        </nav>
      )}

      <Revelar inmediato escalonar y={20} className="mb-10">
        <h1 className="titulo text-3xl text-mist-50 sm:text-5xl">{titulo}</h1>
        <p className="mt-3 max-w-2xl text-sm text-mist-400 sm:text-base">{bajada}</p>
      </Revelar>

      <CatalogoCliente
        motos={motos}
        categorias={categorias}
        marcas={marcas}
        filtroInicial={filtroInicial}
      />
    </div>
  );
}
