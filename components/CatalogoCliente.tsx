'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import MotoCard from './MotoCard';
import RevelarGrilla from './RevelarGrilla';
import { CATEGORIAS, type CategoriaSlug } from '@/data/motos';
import type { MotoWeb } from '@/lib/catalogo';

type Props = {
  motos: MotoWeb[];
  categorias: { slug: CategoriaSlug; nombre: string; total: number }[];
  marcas: { marca: string; slug: string; total: number }[];
  /**
   * Filtro con el que arranca la página. Viene del servidor (las rutas
   * /catalogo/marca/... y /catalogo/categoria/...), no de la URL leída en el
   * navegador: así el HTML ya sale filtrado y la página sigue siendo estática.
   */
  filtroInicial?: { marca?: string; categoria?: CategoriaSlug };
};

type Orden = 'relevancia' | 'marca' | 'cc-asc' | 'cc-desc';

const ORDENES: { id: Orden; label: string }[] = [
  { id: 'relevancia', label: 'Relevancia' },
  { id: 'marca', label: 'Marca y modelo' },
  { id: 'cc-asc', label: 'Menor cilindrada' },
  { id: 'cc-desc', label: 'Mayor cilindrada' },
];

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

type Filtros = {
  busqueda: string;
  categoria: string;
  marca: string;
  tramo: string;
  soloStock: boolean;
  orden: Orden;
};

/**
 * Filtros → query string. Los que ya vienen implícitos en la ruta no se
 * repiten: en /catalogo/marca/bajaj la marca no hace falta escribirla.
 *
 * Cuando el visitante cambia uno de esos sí se escribe, incluso vacío, que es
 * como se distingue "no dijo nada" de "puso Todas".
 */
function aQuery(f: Filtros, implicito: { marca: string; categoria: string }): string {
  const p = new URLSearchParams();
  if (f.busqueda) p.set('q', f.busqueda);
  if (f.categoria !== implicito.categoria) p.set('cat', f.categoria);
  if (f.marca !== implicito.marca) p.set('marca', f.marca);
  if (f.tramo) p.set('cc', f.tramo);
  if (f.soloStock) p.set('stock', '1');
  if (f.orden !== 'relevancia') p.set('orden', f.orden);
  return p.toString();
}

/**
 * A qué página corresponde este juego de filtros.
 *
 * La marca y la categoría tienen página propia —/catalogo/marca/bajaj,
 * /catalogo/categoria/enduro— y el título, la bajada y las migas de esas
 * páginas los escribe el servidor. Si el filtro se moviera sin cambiar de
 * ruta, la página quedaría diciendo "MOTOS BAJAJ" arriba de una grilla de
 * Honda.
 *
 * Marca y categoría pueden estar puestas las dos y en la ruta entra una sola:
 * manda la que el visitante acaba de tocar, y la otra viaja en la query.
 */
function rutaCanonica(
  f: Filtros,
  manda: 'marca' | 'categoria',
  marcas: { marca: string; slug: string }[],
): { ruta: string; implicito: { marca: string; categoria: string } } {
  const todo = { ruta: '/catalogo', implicito: { marca: '', categoria: '' } };

  // Si la marca no está en la lista no hay página adonde ir: antes que mandar
  // a /catalogo/marca/undefined, que sería un 404, se queda en el catálogo y
  // la marca filtra desde la query.
  const porMarca = () => {
    const slug = marcas.find((m) => m.marca === f.marca)?.slug;
    if (!slug) return todo;
    return { ruta: `/catalogo/marca/${slug}`, implicito: { marca: f.marca, categoria: '' } };
  };
  const porCategoria = () => ({
    ruta: `/catalogo/categoria/${f.categoria}`,
    implicito: { marca: '', categoria: f.categoria },
  });

  if (manda === 'marca' && f.marca) return porMarca();
  if (manda === 'categoria' && f.categoria) return porCategoria();
  // El que se acaba de tocar quedó en "Todas": manda el otro, si quedó alguno.
  if (f.marca) return porMarca();
  if (f.categoria) return porCategoria();
  return todo;
}

/**
 * Como useLayoutEffect, pero sin romper en el servidor. Corre antes de que el
 * navegador pinte, así al volver atrás no se ve un parpadeo con el catálogo
 * entero antes de que se apliquen los filtros.
 */
const useEfectoAntesDePintar = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function CatalogoCliente({ motos, categorias, marcas, filtroInicial }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string>(filtroInicial?.categoria ?? '');
  const [marca, setMarca] = useState<string>(filtroInicial?.marca ?? '');
  const [tramo, setTramo] = useState<string>('');
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden] = useState<Orden>('relevancia');
  const [leidaLaUrl, setLeidaLaUrl] = useState(false);

  const router = useRouter();
  const yendose = useRef(false);

  const marcaInicial = filtroInicial?.marca ?? '';
  const categoriaInicial = filtroInicial?.categoria ?? '';

  /* ---------------------------------------------------------------- */
  /* Los filtros viven en la query string                               */
  /*                                                                    */
  /* Es lo que hace andar el botón "atrás": el visitante filtra, entra a */
  /* una ficha y vuelve, y el navegador lo devuelve a la URL que tenía   */
  /* los filtros puestos. Sin esto la página se remonta en blanco y se   */
  /* pierde todo lo que había elegido. De paso, una búsqueda filtrada    */
  /* se puede compartir por WhatsApp y le abre lo mismo al otro.         */
  /*                                                                    */
  /* Se lee con window.location y no con useSearchParams a propósito:    */
  /* useSearchParams obliga a Next a renderizar la página en el cliente, */
  /* y el catálogo dejaría de venir en el HTML estático, que es de donde */
  /* lo lee Google.                                                      */
  /* ---------------------------------------------------------------- */

  // Una sola vez, al montar. Se valida todo contra las opciones que existen:
  // una URL escrita a mano con ?cat=cualquiera no tiene que romper la página.
  useEfectoAntesDePintar(() => {
    const p = new URLSearchParams(window.location.search);
    const dice = (clave: string, valido: (v: string) => boolean, poner: (v: string) => void) => {
      const v = p.get(clave);
      if (v !== null) poner(valido(v) ? v : '');
    };

    dice('q', () => true, setBusqueda);
    dice('cat', (v) => categorias.some((c) => c.slug === v), setCategoria);
    dice('marca', (v) => marcas.some((m) => m.marca === v), setMarca);
    dice('cc', (v) => TRAMOS_CC.some((t) => t.id === v), setTramo);
    if (p.has('stock')) setSoloStock(p.get('stock') === '1');

    const o = p.get('orden');
    if (o !== null && ORDENES.some((x) => x.id === o)) setOrden(o as Orden);

    setLeidaLaUrl(true);
    // Sólo al montar: después manda el estado, no la URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada cambio se escribe en la URL con replaceState, sin sumar una entrada
  // al historial: si no, cada letra tipeada sería un "atrás" distinto.
  //
  // Los filtros que ya vienen implícitos en la ruta (/catalogo/marca/bajaj)
  // no se repiten en la query. Cuando el visitante los cambia sí se escriben,
  // incluso vacíos, que es como se distingue "no dijo nada" de "puso Todas".
  useEffect(() => {
    if (!leidaLaUrl) return;

    // Si se está yendo a otra página, la URL la pone la navegación: pisarla
    // acá dejaría la ruta vieja con los filtros nuevos.
    if (yendose.current) {
      yendose.current = false;
      return;
    }

    const query = aQuery(
      { busqueda, categoria, marca, tramo, soloStock, orden },
      { marca: marcaInicial, categoria: categoriaInicial },
    );
    const destino = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (destino !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', destino);
    }
  }, [leidaLaUrl, busqueda, categoria, marca, tramo, soloStock, orden, categoriaInicial, marcaInicial]);

  /**
   * Cambia la marca o la categoría y se muda a la página que corresponde,
   * llevándose el resto de los filtros en la query.
   */
  const cambiarRuta = (manda: 'marca' | 'categoria', valor: string) => {
    const f: Filtros = {
      busqueda,
      tramo,
      soloStock,
      orden,
      marca: manda === 'marca' ? valor : marca,
      categoria: manda === 'categoria' ? valor : categoria,
    };

    // Se aplica en el acto para que el control responda sin esperar la página.
    if (manda === 'marca') setMarca(valor);
    else setCategoria(valor);

    const { ruta, implicito } = rutaCanonica(f, manda, marcas);
    const query = aQuery(f, implicito);
    const destino = query ? `${ruta}?${query}` : ruta;
    if (destino === window.location.pathname + window.location.search) return;

    yendose.current = true;
    // Sin saltar arriba: el panel de filtros queda donde estaba, como cuando
    // el filtro no cambiaba de página.
    router.push(destino, { scroll: false });
  };

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

    // "Limpiar filtros" saca todos, incluido el que trae la ruta: estando en
    // /catalogo/marca/bajaj la vuelta es al catálogo entero. El ordenamiento
    // no es un filtro y se respeta.
    const query = aQuery(
      { busqueda: '', categoria: '', marca: '', tramo: '', soloStock: false, orden },
      { marca: '', categoria: '' },
    );
    const destino = query ? `/catalogo?${query}` : '/catalogo';
    if (destino === window.location.pathname + window.location.search) return;

    yendose.current = true;
    router.push(destino, { scroll: false });
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
            <Chip activo={categoria === ''} onClick={() => cambiarRuta('categoria', '')}>
              Todas
            </Chip>
            {categorias.map((c) => (
              <Chip key={c.slug} activo={categoria === c.slug} onClick={() => cambiarRuta('categoria', c.slug)}>
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
              onChange={(e) => cambiarRuta('marca', e.target.value)}
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
              {ORDENES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
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
