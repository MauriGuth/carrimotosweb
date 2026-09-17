import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GaleriaMoto from '@/components/GaleriaMoto';
import MotoCard from '@/components/MotoCard';
import BotonesSucursales from '@/components/BotonesSucursales';
import Revelar from '@/components/Revelar';
import RevelarGrilla from '@/components/RevelarGrilla';
import PromosDeLaMoto from '@/components/PromosDeLaMoto';
import { CATEGORIAS } from '@/data/motos';
import { NEGOCIO } from '@/data/sucursales';
import {
  fichaDe,
  promosDe,
  fotosDe,
  motoPorSlug,
  motosRelacionadas,
  resumenMoto,
  slugMarca,
  todasLasMotos,
} from '@/lib/catalogo';
import FichaTecnica from '@/components/FichaTecnica';
import { capitalizar } from '@/lib/formato';

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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await todasLasMotos()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const moto = await motoPorSlug(slug);
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
  const moto = await motoPorSlug(slug);
  if (!moto) notFound();

  const categoria = CATEGORIAS[moto.categoria];
  const [relacionadas, fotos, ficha, promos] = await Promise.all([
    motosRelacionadas(moto),
    fotosDe(moto.slug),
    fichaDe(moto.slug),
    promosDe(moto.slug),
  ]);

  const resumen: { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Marca', valor: moto.marca },
    { etiqueta: 'Modelo', valor: capitalizar(moto.modelo) },
    { etiqueta: 'Categoría', valor: categoria.nombre },
  ];
  if (!ficha.cilindrada && moto.cilindrada) resumen.push({ etiqueta: 'Cilindrada', valor: `${moto.cilindrada} cc` });
  if (moto.colores.length) {
    resumen.push({ etiqueta: 'Colores disponibles', valor: moto.colores.map(capitalizar).join(' · ') });
  }
  resumen.push({ etiqueta: 'Disponibilidad', valor: moto.enStock ? 'Entrega inmediata' : 'A pedido — consultá plazo' });

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
        <Link href={`/catalogo/marca/${slugMarca(moto.marca)}`} className="transition-colors hover:text-carri">
          {moto.marca}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-mist-300">{capitalizar(moto.modelo)}</span>
      </nav>

      <Revelar inmediato escalonar y={24} className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative">
          <GaleriaMoto fotos={fotos} nombre={moto.nombre} marca={moto.marca} />
          {moto.enStock && (
            <span className="titulo absolute left-4 top-4 z-10 rounded bg-carri px-3 py-1.5 text-[11px] tracking-widest text-white">
              Entrega inmediata
            </span>
          )}
        </div>

        <div>
          <p className="titulo text-xs tracking-[0.25em] text-carri">{moto.marca}</p>
          <h1 className="titulo mt-2 text-3xl leading-tight text-mist-50 sm:text-5xl">{capitalizar(moto.modelo)}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/catalogo/categoria/${moto.categoria}`}
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

          {/* Lo que el cliente escribe en Nova (Web → Catálogo). Vacío no ocupa
              lugar. `whitespace-pre-line` respeta los saltos de línea que haya
              tipeado, sin habilitar HTML. */}
          {moto.descripcion && (
            <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-mist-300">
              {moto.descripcion}
            </p>
          )}

          <PromosDeLaMoto promos={promos} />

          <div className="mt-7 rounded-xl border border-ink-700 bg-ink-900 p-5">
            <p className="titulo text-xs tracking-widest text-mist-500">Precio</p>
            <p className="titulo mt-1 text-2xl text-mist-50">Consultá por WhatsApp</p>
            <p className="mt-2 text-sm text-mist-400">
              Te pasamos el precio del día, las formas de pago y la financiación disponible.
            </p>
          </div>

          <div className="mt-7">
            <h2 className="titulo mb-3 text-sm tracking-widest text-mist-500">De un vistazo</h2>
            <dl className="overflow-hidden rounded-xl border border-ink-700">
              {resumen.map((f, i) => (
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

      <Revelar>
        <FichaTecnica ficha={ficha} nombre={moto.nombre} />
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
