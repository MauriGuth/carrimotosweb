'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MotoCard from './MotoCard';
import RevelarGrilla from './RevelarGrilla';
import { CATEGORIAS, type CategoriaSlug, type Moto } from '@/data/motos';

type Props = {
  motos: Moto[];
  categorias: { slug: CategoriaSlug; nombre: string; total: number }[];
  marcas: { marca: string; total: number }[];
};

type Orden = 'relevancia' | 'marca' | 'cc-asc' | 'cc-desc';

const TRAMOS_CC: { id: string; label: string; min: number; max: number }[] = [
  { id: 'hasta-125', label: 'Hasta 125cc', min: 0, max: 125 },
  { id: '126-250', label: '126 a 250cc', min: 126, max: 250 },
  { id: '251-500', label: '251 a 500cc', min: 251, max: 500 },
  { id: 'mas-500', label: 'Más de 500cc', min: 501, max: Infinity },
];

/** Saca acentos y pasa a minúsculas para que el buscador sea tolerante. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function CatalogoCliente({ motos, categorias, marcas }: Props) {
  const params = useSearchParams();

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string>(params.get('categoria') ?? '');
  const [marca, setMarca] = useState<string>(params.get('marca') ?? '');
  const [tramo, setTramo] = useState<string>('');
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden] = useState<Orden>('relevancia');

  const resultado = useMemo(() => {
    const q = normalizar(busqueda.trim());
    const rango = TRAMOS_CC.find((t) => t.id === tramo);

    const filtradas = motos.filter((m) => {
      if (categoria && m.categoria !== categoria) return false;
      if (marca && m.marca !== marca) return false;
      if (soloStock && !m.enStock) return false;
      if (rango) {
        if (m.cilindrada === null) return false;
        if (m.cilindrada < rango.min || m.cilindrada > rango.max) return false;
      }
      if (q && !normalizar(m.nombre).includes(q)) return false;
      return true;
    });

    const ordenadas = [...filtradas];
    switch (orden) {
      case 'marca':
        ordenadas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'cc-asc':
        ordenadas.sort((a, b) => (a.cilindrada ?? Infinity) - (b.cilindrada ?? Infinity));
        break;
      case 'cc-desc':
        ordenadas.sort((a, b) => (b.cilindrada ?? -1) - (a.cilindrada ?? -1));
        break;
      default:
        // Relevancia: primero lo que hay en el local.
        ordenadas.sort((a, b) => Number(b.enStock) - Number(a.enStock) || a.nombre.localeCompare(b.nombre));
    }
    return ordenadas;
  }, [motos, busqueda, categoria, marca, tramo, soloStock, orden]);

  const hayFiltros = Boolean(busqueda || categoria || marca || tramo || soloStock);

  const limpiar = () => {
    setBusqueda('');
    setCategoria('');
    setMarca('');
    setTramo('');
    setSoloStock(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col gap-6 rounded-xl border border-ink-700 bg-ink-900 p-5">
          <div>
            <label htmlFor="buscar" className="titulo mb-2 block text-xs tracking-widest text-mist-500">
              Buscar
            </label>
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="buscar"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Modelo o marca…"
                className="w-full rounded-lg border border-ink-700 bg-ink-850 py-2.5 pl-9 pr-3 text-sm text-mist-50 placeholder:text-mist-500 focus:border-carri focus:outline-none"
              />
            </div>
          </div>

          <Grupo titulo="Categoría">
            <Chip activo={categoria === ''} onClick={() => setCategoria('')}>
              Todas
            </Chip>
            {categorias.map((c) => (
              <Chip key={c.slug} activo={categoria === c.slug} onClick={() => setCategoria(c.slug)}>
                {c.nombre}
              </Chip>
            ))}
          </Grupo>

          <Grupo titulo="Cilindrada">
            <Chip activo={tramo === ''} onClick={() => setTramo('')}>
              Todas
            </Chip>
            {TRAMOS_CC.map((t) => (
              <Chip key={t.id} activo={tramo === t.id} onClick={() => setTramo(t.id)}>
                {t.label}
              </Chip>
            ))}
          </Grupo>

          <div>
            <label htmlFor="marca" className="titulo mb-2 block text-xs tracking-widest text-mist-500">
              Marca
            </label>
            <select
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-mist-50 focus:border-carri focus:outline-none"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m.marca} value={m.marca}>
                  {m.marca} ({m.total})
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist-200">
            <input
              type="checkbox"
              checked={soloStock}
              onChange={(e) => setSoloStock(e.target.checked)}
              className="h-4 w-4 accent-[#e11b22]"
            />
            Sólo entrega inmediata
          </label>

          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="titulo rounded-lg border border-ink-700 py-2.5 text-xs tracking-widest text-mist-300 transition-colors hover:border-carri hover:text-carri"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-mist-400" aria-live="polite">
            <span className="font-semibold text-mist-50">{resultado.length}</span>{' '}
            {resultado.length === 1 ? 'modelo' : 'modelos'}
            {categoria && ` en ${CATEGORIAS[categoria as CategoriaSlug].nombre}`}
            {marca && ` de ${marca}`}
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="orden" className="text-xs text-mist-500">
              Ordenar por
            </label>
            <select
              id="orden"
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-mist-50 focus:border-carri focus:outline-none"
            >
              <option value="relevancia">Relevancia</option>
              <option value="marca">Marca y modelo</option>
              <option value="cc-asc">Menor cilindrada</option>
              <option value="cc-desc">Mayor cilindrada</option>
            </select>
          </div>
        </div>

        {resultado.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-700 px-6 py-16 text-center">
            <p className="titulo text-lg text-mist-200">No encontramos motos con esos filtros</p>
            <p className="mt-2 text-sm text-mist-400">Probá con otra marca o sacá algún filtro.</p>
            <button
              type="button"
              onClick={limpiar}
              className="titulo mt-6 rounded-lg bg-carri px-5 py-2.5 text-xs tracking-widest text-white transition-colors hover:bg-carri-hi"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <RevelarGrilla
            // Al cambiar los filtros cambia la clave y las tarjetas nuevas
            // vuelven a entrar animadas.
            clave={`${categoria}|${marca}|${tramo}|${soloStock}|${orden}|${busqueda}`}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {resultado.map((m, i) => (
              <MotoCard key={m.slug} moto={m} prioridad={i < 6} />
            ))}
          </RevelarGrilla>
        )}
      </div>
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="titulo mb-2.5 text-xs tracking-widest text-mist-500">{titulo}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
        activo
          ? 'border-carri bg-carri text-white'
          : 'border-ink-700 text-mist-300 hover:border-mist-500 hover:text-mist-50'
      }`}
    >
      {children}
    </button>
  );
}
