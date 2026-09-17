import Link from 'next/link';
import MotoCard from '@/components/MotoCard';
import BotonesSucursales from '@/components/BotonesSucursales';
import MarquesinaMarcas from '@/components/MarquesinaMarcas';
import TiraPromos from '@/components/TiraPromos';
import Revelar from '@/components/Revelar';
import RevelarGrilla from '@/components/RevelarGrilla';
import Contador from '@/components/Contador';
import { ACCESORIOS } from '@/data/accesorios';
import {
  categoriasConConteo,
  promosVigentes,
  marcasConConteo,
  motosDestacadas,
  todasLasMotos,
} from '@/lib/catalogo';

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

export default async function Home() {
  const [motos, categorias, promos, marcas, destacadas] = await Promise.all([
    todasLasMotos(),
    categoriasConConteo(),
    promosVigentes(),
    marcasConConteo(),
    motosDestacadas(8),
  ]);
  const totalAccesorios = ACCESORIOS.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Portada                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div className="absolute inset-0 diagonales opacity-40" aria-hidden="true" />

        {/* Orbes de fondo que se mueven muy lento */}
        <div
          className="anim-orbe absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-carri/20 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="anim-orbe-inverso absolute -bottom-40 left-1/4 h-[22rem] w-[22rem] rounded-full bg-carri/10 blur-[110px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <Revelar escalonar inmediato y={24}>
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
              {motos.length} modelos de {marcas.length} marcas, en nuestras tres sucursales. Mirá el catálogo,
              elegí tu moto y escribinos.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="titulo rounded-lg bg-carri px-7 py-3.5 text-sm tracking-widest text-white transition-all hover:bg-carri-hi hover:shadow-lg hover:shadow-carri/30"
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
                { valor: motos.length, label: 'Modelos' },
                { valor: marcas.length, label: 'Marcas' },
                { valor: 3, label: 'Sucursales' },
              ].map((d) => (
                <div key={d.label}>
                  <dt className="sr-only">{d.label}</dt>
                  <dd>
                    <Contador valor={d.valor} className="titulo block text-3xl text-mist-50 sm:text-4xl" />
                    <span className="mt-1 block text-xs uppercase tracking-wider text-mist-500">{d.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Revelar>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Categorías                                                       */}
      {/* ---------------------------------------------------------------- */}
      <TiraPromos promos={promos} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Encabezado titulo="Buscá por categoría" bajada="Elegí el tipo de moto que estás buscando." />

        <Revelar escalonar escala y={20} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/catalogo/categoria/${c.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-ink-700 bg-ink-850 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-carri/60 hover:shadow-lg hover:shadow-black/40"
            >
              {/* Las franjas del logo, apenas insinuadas, en vez de un ícono */}
              <span
                className="absolute -right-6 -top-6 h-24 w-24 rotate-12 diagonales opacity-40 transition-opacity duration-300 group-hover:opacity-70"
                aria-hidden="true"
              />

              <span className="titulo relative text-lg leading-tight text-mist-50 transition-colors duration-300 group-hover:text-carri sm:text-xl">
                {c.nombre}
              </span>

              <span className="relative mt-6 flex items-end justify-between gap-2">
                <span className="text-xs text-mist-500">
                  <span className="titulo mr-1 text-base text-mist-200">{c.total}</span>
                  modelos
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-ink-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-carri"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </Link>
          ))}
        </Revelar>
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

          <RevelarGrilla className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destacadas.map((m, i) => (
              <MotoCard key={m.slug} moto={m} prioridad={i < 4} />
            ))}
          </RevelarGrilla>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Marcas                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Encabezado titulo="Trabajamos con las mejores marcas" bajada="Tocá una marca para ver todos sus modelos." />
        </div>
        <Revelar y={16}>
          <MarquesinaMarcas marcas={marcas} />
        </Revelar>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Accesorios                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Revelar>
          <Link
            href="/accesorios"
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 p-8 transition-colors hover:border-carri/50 sm:flex-row sm:items-center sm:justify-between sm:p-10"
          >
            <div className="absolute inset-0 diagonales opacity-50" aria-hidden="true" />
            <div
              className="anim-orbe absolute -right-20 -top-20 h-64 w-64 rounded-full bg-carri/10 blur-[80px]"
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="titulo text-2xl text-mist-50 sm:text-3xl">Cascos, guantes y accesorios</h2>
              <p className="mt-2 max-w-lg text-sm text-mist-400">
                {totalAccesorios} artículos con precio actualizado: cascos, guantes, lingas, antiparras y aceites.
              </p>
            </div>
            <span className="titulo relative shrink-0 rounded-lg bg-carri px-6 py-3 text-xs tracking-widest text-white transition-all duration-300 group-hover:bg-carri-hi group-hover:shadow-lg group-hover:shadow-carri/30">
              Ver accesorios
            </span>
          </Link>
        </Revelar>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Contacto                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <Encabezado titulo="Hablá con nosotros" bajada="Escribinos a la sucursal que te quede más cómoda." />
        <Revelar escalonar y={20}>
          <BotonesSucursales />
        </Revelar>
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
    <Revelar y={18} className="mb-8 flex flex-wrap items-end justify-between gap-4">
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
    </Revelar>
  );
}
