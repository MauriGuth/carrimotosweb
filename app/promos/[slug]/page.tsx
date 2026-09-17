import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MotoCard from '@/components/MotoCard';
import BotonesSucursales from '@/components/BotonesSucursales';
import Revelar from '@/components/Revelar';
import RevelarGrilla from '@/components/RevelarGrilla';
import { motosDeLaPromo, promoPorSlug, promosVigentes } from '@/lib/catalogo';

type Props = { params: Promise<{ slug: string }> };

/**
 * El catálogo sale de Nova y el cliente lo edita desde el panel, así que esta
 * página se vuelve a generar cada minuto.
 */
export const revalidate = 60;

export async function generateStaticParams() {
  return (await promosVigentes()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const promo = await promoPorSlug(slug);
  if (!promo) return { title: 'Promo no encontrada' };
  return {
    title: promo.titulo,
    description: promo.bajada ?? `${promo.titulo} en CARRI Motos.`,
    alternates: { canonical: `/promos/${promo.slug}` },
  };
}

export default async function PromoPage({ params }: Props) {
  const { slug } = await params;
  const promo = await promoPorSlug(slug);
  // Una promo que venció o que el cliente apagó deja de venir de Nova, así que
  // su página desaparece sola en la próxima regeneración.
  if (!promo) notFound();

  const motos = await motosDeLaPromo(promo);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Revelar>
        <nav className="text-xs text-mist-500">
          <Link href="/" className="transition-colors hover:text-carri">
            Inicio
          </Link>
          {' / '}
          <Link href="/promos" className="transition-colors hover:text-carri">
            Promos
          </Link>
          {' / '}
          <span className="text-mist-300">{promo.titulo}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            {promo.destacado && (
              <p className="titulo text-4xl text-amber-300 sm:text-5xl">{promo.destacado}</p>
            )}
            <h1 className="titulo mt-2 text-3xl leading-tight text-mist-50 sm:text-5xl">
              {promo.titulo}
            </h1>
            {promo.bajada && <p className="mt-3 text-lg text-mist-300">{promo.bajada}</p>}
            {promo.texto && (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-mist-400">{promo.texto}</p>
            )}
            {promo.hasta && (
              <p className="mt-4 text-sm text-mist-500">
                Vigente hasta el{' '}
                {new Date(promo.hasta).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                .
              </p>
            )}

            <div className="mt-8">
              <h2 className="titulo mb-3 text-sm tracking-widest text-mist-500">
                Consultá por esta promo
              </h2>
              <BotonesSucursales moto={promo.titulo} formato="lista" />
            </div>
          </div>

          {promo.imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={promo.imagen}
              alt={promo.titulo}
              className="w-full rounded-xl border border-ink-700 object-contain"
            />
          )}
        </div>
      </Revelar>

      {motos.length > 0 && (
        <section className="mt-16 border-t border-ink-700 pt-12">
          <h2 className="titulo text-2xl text-mist-50">Modelos en esta promo</h2>
          <RevelarGrilla className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {motos.map((moto) => (
              <MotoCard key={moto.slug} moto={moto} />
            ))}
          </RevelarGrilla>
        </section>
      )}
    </div>
  );
}
