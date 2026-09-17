import Link from 'next/link';
import type { Promo } from '@/lib/catalogo';

/**
 * Las promos que le tocan a una moto, en su ficha. Va arriba del precio: es lo
 * primero que el que entra tiene que ver.
 */
export default function PromosDeLaMoto({ promos }: { promos: Promo[] }) {
  if (!promos.length) return null;

  return (
    <div className="mt-7 space-y-3">
      {promos.map((promo) => (
        <Link
          key={promo.slug}
          href={`/promos/${promo.slug}`}
          className="block rounded-xl border border-amber-400/40 bg-amber-400/10 p-5 transition-colors hover:border-amber-400/70"
        >
          <p className="titulo text-xs tracking-widest text-amber-300">Promo</p>
          {promo.destacado && (
            <p className="titulo mt-1 text-2xl text-amber-200">{promo.destacado}</p>
          )}
          <p className="mt-1 text-sm font-medium text-mist-100">{promo.titulo}</p>
          {promo.bajada && <p className="mt-1 text-sm text-mist-400">{promo.bajada}</p>}
          {promo.hasta && (
            <p className="mt-2 text-xs text-mist-500">
              Hasta el{' '}
              {new Date(promo.hasta).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
              })}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
