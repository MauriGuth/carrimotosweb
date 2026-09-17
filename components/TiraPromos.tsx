import Link from 'next/link';
import type { Promo } from '@/lib/catalogo';

/**
 * Las promos vigentes en la home. Si no hay ninguna no ocupa lugar: el sitio
 * se ve exactamente como antes.
 */
export default function TiraPromos({ promos }: { promos: Promo[] }) {
  if (!promos.length) return null;

  return (
    <section className="border-b border-ink-700 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="titulo text-2xl text-mist-50 sm:text-3xl">Promos vigentes</h2>
          <Link
            href="/promos"
            className="titulo text-xs tracking-widest text-carri transition-colors hover:text-carri/80"
          >
            Ver todas
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promos.slice(0, 3).map((promo) => (
            <Link
              key={promo.slug}
              href={`/promos/${promo.slug}`}
              className="group overflow-hidden rounded-xl border border-ink-700 bg-ink-850 transition-all hover:-translate-y-1 hover:border-amber-400/60"
            >
              {promo.miniatura && (
                // La imagen la sube el cliente desde Nova y no pasa por el
                // optimizador de Next: es de un bucket externo y ya viene en
                // la medida justa.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={promo.miniatura}
                  alt=""
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="p-5">
                {promo.destacado && (
                  <p className="titulo text-xl text-amber-300">{promo.destacado}</p>
                )}
                <h3 className="titulo mt-1 text-base text-mist-50">{promo.titulo}</h3>
                {promo.bajada && <p className="mt-1 text-sm text-mist-400">{promo.bajada}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
