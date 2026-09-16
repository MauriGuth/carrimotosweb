import Link from 'next/link';
import MotoCard from '@/components/MotoCard';
import BotonesSucursales from '@/components/BotonesSucursales';
import { MOTOS } from '@/data/motos';
import { ACCESORIOS } from '@/data/accesorios';
import { categoriasConConteo, marcasConConteo, motosDestacadas } from '@/lib/catalogo';

const ICONOS_CATEGORIA: Record<string, string> = {
  economicas: 'M4 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0m10 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M7 17h6l3-6h3M9 11h5l-2-4H8',
  calle: 'M5 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0m8 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M8 18h5l2-7h4M10 11h4l-1-4H9',
  scooter: 'M5 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0m9 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M8 17h6l1-9h3M7 12h5',
  enduro: 'M4 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0m10 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M7 16l4-7 3 7m-3-7 4-3',
  touring: 'M4 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0m10 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M7 17h6l2-8h3M9 9h5',
  custom: 'M4 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0m10 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0M7 17h5l4-5h3M9 12h4',
  ninos: 'M6 17a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0m8 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0M9 17h5l2-5h2',
  utilitario: 'M3 16h11V7H3zm11-5h4l3 3v2h-7M6 18.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m9 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0',
};

export default function Home() {
  const categorias = categoriasConConteo();
  const marcas = marcasConConteo();
  const destacadas = motosDestacadas(8);
  const totalAccesorios = ACCESORIOS.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Portada                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div className="absolute inset-0 diagonales opacity-40" aria-hidden="true" />
        <div
          className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-carri/20 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <p className="titulo mb-4 flex items-center gap-3 text-xs tracking-[0.3em] text-carri">
            <span className="h-px w-8 bg-carri" aria-hidden="true" />
            Concesionario de motos
          </p>

          <h1 className="titulo max-w-3xl text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Tu próxima moto
            <br />
            <span className="text-carri">está en CARRI</span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-mist-300 sm:text-lg">
            {MOTOS.length} modelos de {marcas.length} marcas, en nuestras tres sucursales. Mirá el catálogo,
            elegí tu moto y escribinos por WhatsApp.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="titulo rounded-lg bg-carri px-7 py-3.5 text-sm tracking-widest text-white transition-colors hover:bg-carri-hi"
            >
              Ver catálogo
            </Link>
            <Link
              href="/sucursales"
              className="titulo rounded-lg border border-ink-600 px-7 py-3.5 text-sm tracking-widest text-mist-100 transition-colors hover:border-mist-400"
            >
              Nuestras sucursales
            </Link>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-ink-700 pt-8">
            {[
              { valor: MOTOS.length, label: 'Modelos' },
              { valor: marcas.length, label: 'Marcas' },
              { valor: 3, label: 'Sucursales' },
            ].map((d) => (
              <div key={d.label}>
                <dt className="sr-only">{d.label}</dt>
                <dd>
                  <span className="titulo block text-3xl text-mist-50 sm:text-4xl">{d.valor}</span>
                  <span className="mt-1 block text-xs tracking-wider text-mist-500 uppercase">{d.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Categorías                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Encabezado titulo="Buscá por categoría" bajada="Elegí el tipo de moto que estás buscando." />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/catalogo?categoria=${c.slug}`}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-ink-700 bg-ink-850 p-5 transition-all hover:-translate-y-1 hover:border-carri/60"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-carri"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={ICONOS_CATEGORIA[c.slug]} />
              </svg>
              <span className="titulo text-sm text-mist-50">{c.nombre}</span>
              <span className="text-xs text-mist-500">{c.total} modelos</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Destacadas                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-ink-700 bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Encabezado
            titulo="Entrega inmediata"
            bajada="Unidades disponibles en el local para llevarte hoy."
            accion={{ href: '/catalogo', label: 'Ver todo el catálogo' }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destacadas.map((m, i) => (
              <MotoCard key={m.slug} moto={m} prioridad={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Marcas                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Encabezado titulo="Trabajamos con las mejores marcas" bajada="Tocá una marca para ver todos sus modelos." />

        <div className="flex flex-wrap gap-2">
          {marcas.map((m) => (
            <Link
              key={m.marca}
              href={`/catalogo?marca=${encodeURIComponent(m.marca)}`}
              className="titulo flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-4 py-3 text-sm tracking-wide text-mist-200 transition-colors hover:border-carri hover:text-carri"
            >
              {m.marca}
              <span className="text-xs text-mist-500">{m.total}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Accesorios                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Link
          href="/accesorios"
          className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="absolute inset-0 diagonales opacity-50" aria-hidden="true" />
          <div className="relative">
            <h2 className="titulo text-2xl text-mist-50 sm:text-3xl">Cascos, guantes y accesorios</h2>
            <p className="mt-2 max-w-lg text-sm text-mist-400">
              {totalAccesorios} artículos con precio actualizado: cascos, guantes, lingas, antiparras y aceites.
            </p>
          </div>
          <span className="titulo relative shrink-0 rounded-lg bg-carri px-6 py-3 text-xs tracking-widest text-white transition-colors group-hover:bg-carri-hi">
            Ver accesorios
          </span>
        </Link>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Contacto                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <Encabezado
          titulo="Hablá con nosotros"
          bajada="Escribinos a la sucursal que te quede más cómoda."
        />
        <BotonesSucursales />
      </section>
    </>
  );
}

function Encabezado({
  titulo,
  bajada,
  accion,
}: {
  titulo: string;
  bajada: string;
  accion?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="titulo text-2xl text-mist-50 sm:text-3xl">{titulo}</h2>
        <p className="mt-2 text-sm text-mist-400">{bajada}</p>
      </div>
      {accion && (
        <Link
          href={accion.href}
          className="titulo flex items-center gap-1.5 text-xs tracking-widest text-carri transition-colors hover:text-carri-hi"
        >
          {accion.label}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
