import Link from 'next/link';
import type { Metadata } from 'next';
import Revelar from '@/components/Revelar';
import { promosVigentes } from '@/lib/catalogo';

/**
 * El catálogo sale de Nova y el cliente lo edita desde el panel, así que esta
 * página se vuelve a generar cada minuto.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Promos',
  description: 'Las promociones vigentes de CARRI Motos: financiación, bonificaciones y campañas.',
  alternates: { canonical: '/promos' },
};

export default async function PromosPage() {
  const promos = await promosVigentes();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Revelar>
        <h1 className="titulo text-4xl text-mist-50 sm:text-6xl">PROMOS</h1>
        <p className="mt-3 max-w-2xl text-mist-400">
          {promos.length
            ? 'Las promociones que están vigentes hoy. Consultanos por WhatsApp para cerrar.'
            : 'Por ahora no hay promociones vigentes. Escribinos por WhatsApp y te contamos las condiciones del momento.'}
        </p>
      </Revelar>

      {promos.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <Link
              key={promo.slug}
              href={`/promos/${promo.slug}`}
              className="group overflow-hidden rounded-xl border border-ink-700 bg-ink-850 transition-all hover:-translate-y-1 hover:border-amber-400/60"
            >
              {promo.miniatura && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={promo.miniatura}
                  alt=""
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="p-5">
                {promo.destacado && (
                  <p className="titulo text-2xl text-amber-300">{promo.destacado}</p>
                )}
                <h2 className="titulo mt-1 text-lg text-mist-50">{promo.titulo}</h2>
                {promo.bajada && <p className="mt-1 text-sm text-mist-400">{promo.bajada}</p>}
                <p className="mt-3 text-xs text-mist-500">
                  {promo.modelos.length
                    ? `${promo.modelos.length} modelo${promo.modelos.length === 1 ? '' : 's'}`
                    : 'Toda la web'}
                  {promo.hasta
                    ? ` · hasta el ${new Date(promo.hasta).toLocaleDateString('es-AR')}`
                    : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
