import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MotoImagen from '@/components/MotoImagen';
import MotoCard from '@/components/MotoCard';
import BotonesSucursales from '@/components/BotonesSucursales';
import Revelar from '@/components/Revelar';
import RevelarGrilla from '@/components/RevelarGrilla';
import { CATEGORIAS, MOTOS } from '@/data/motos';
import { NEGOCIO } from '@/data/sucursales';
import { motoPorSlug, motosRelacionadas, resumenMoto } from '@/lib/catalogo';
import { capitalizar } from '@/lib/formato';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MOTOS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const moto = motoPorSlug(slug);
  if (!moto) return { title: 'Modelo no encontrado' };

  const descripcion = `${moto.nombre} en CARRI Motos. ${resumenMoto(moto)}. Consultá precio y disponibilidad por WhatsApp.`;
  return {
    title: moto.nombre,
    description: descripcion,
    alternates: { canonical: `/moto/${moto.slug}` },
    openGraph: {
      title: `${moto.nombre} | CARRI Motos`,
      description: descripcion,
      url: `/moto/${moto.slug}`,
    },
  };
}

export default async function MotoPage({ params }: Props) {
  const { slug } = await params;
  const moto = motoPorSlug(slug);
  if (!moto) notFound();

  const categoria = CATEGORIAS[moto.categoria];
  const relacionadas = motosRelacionadas(moto);

  const ficha: { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Marca', valor: moto.marca },
    { etiqueta: 'Modelo', valor: capitalizar(moto.modelo) },
    { etiqueta: 'Categoría', valor: categoria.nombre },
  ];
  if (moto.cilindrada) ficha.push({ etiqueta: 'Cilindrada', valor: `${moto.cilindrada} cc` });
  if (moto.colores.length) {
    ficha.push({ etiqueta: 'Colores disponibles', valor: moto.colores.map(capitalizar).join(' · ') });
  }
  ficha.push({ etiqueta: 'Disponibilidad', valor: moto.enStock ? 'Entrega inmediata' : 'A pedido — consultá plazo' });

  // Datos estructurados para que Google entienda la ficha.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: moto.nombre,
    brand: { '@type': 'Brand', name: moto.marca },
    category: categoria.nombre,
    url: `${NEGOCIO.sitio}/moto/${moto.slug}`,
    offers: {
      '@type': 'Offer',
      availability: moto.enStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      priceCurrency: 'ARS',
      url: `${NEGOCIO.sitio}/moto/${moto.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Migas de pan" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-mist-500">
        <Link href="/" className="transition-colors hover:text-carri">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalogo" className="transition-colors hover:text-carri">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/catalogo?marca=${encodeURIComponent(moto.marca)}`} className="transition-colors hover:text-carri">
          {moto.marca}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-mist-300">{capitalizar(moto.modelo)}</span>
      </nav>

      <Revelar inmediato escalonar y={24} className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-4/3 self-start overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
          <div className="absolute inset-0 diagonales opacity-30" aria-hidden="true" />
          <MotoImagen
            slug={moto.slug}
            nombre={moto.nombre}
            marca={moto.marca}
            prioridad
            className="relative h-full w-full"
          />
          {moto.enStock && (
            <span className="titulo absolute left-4 top-4 rounded bg-carri px-3 py-1.5 text-[11px] tracking-widest text-white">
              Entrega inmediata
            </span>
          )}
        </div>

        <div>
          <p className="titulo text-xs tracking-[0.25em] text-carri">{moto.marca}</p>
          <h1 className="titulo mt-2 text-3xl leading-tight text-mist-50 sm:text-5xl">{capitalizar(moto.modelo)}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/catalogo?categoria=${moto.categoria}`}
              className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-mist-300 transition-colors hover:border-carri hover:text-carri"
            >
              {categoria.nombre}
            </Link>
            {moto.cilindrada && (
              <span className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-mist-300">
                {moto.cilindrada} cc
              </span>
            )}
            {moto.altaGama && (
              <span className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-mist-300">Alta gama</span>
            )}
          </div>

          <div className="mt-7 rounded-xl border border-ink-700 bg-ink-900 p-5">
            <p className="titulo text-xs tracking-widest text-mist-500">Precio</p>
            <p className="titulo mt-1 text-2xl text-mist-50">Consultá por WhatsApp</p>
            <p className="mt-2 text-sm text-mist-400">
              Te pasamos el precio del día, las formas de pago y la financiación disponible.
            </p>
          </div>

          <div className="mt-7">
            <h2 className="titulo mb-3 text-sm tracking-widest text-mist-500">Ficha</h2>
            <dl className="overflow-hidden rounded-xl border border-ink-700">
              {ficha.map((f, i) => (
                <div
                  key={f.etiqueta}
                  className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${
                    i % 2 === 0 ? 'bg-ink-900' : 'bg-ink-850'
                  }`}
                >
                  <dt className="text-mist-400">{f.etiqueta}</dt>
                  <dd className="text-right font-medium text-mist-50">{f.valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-mist-500">
              Colores y disponibilidad según stock del local. Consultanos por la ficha técnica completa del modelo.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="titulo mb-3 text-sm tracking-widest text-mist-500">Pedí más información</h2>
            <BotonesSucursales moto={moto.nombre} formato="lista" />
          </div>
        </div>
      </Revelar>

      {relacionadas.length > 0 && (
        <section className="mt-16 border-t border-ink-700 pt-12">
          <h2 className="titulo mb-8 text-2xl text-mist-50">También te puede interesar</h2>
          <RevelarGrilla className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relacionadas.map((m) => (
              <MotoCard key={m.slug} moto={m} />
            ))}
          </RevelarGrilla>
        </section>
      )}
    </div>
  );
}
