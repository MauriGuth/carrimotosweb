import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import VistaCatalogo from '@/components/VistaCatalogo';
import { marcaPorSlug, marcasConConteo, todasLasMotos } from '@/lib/catalogo';

type Props = { params: Promise<{ marca: string }> };

export async function generateStaticParams() {
  return (await marcasConConteo()).map(({ slug }) => ({ marca: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { marca: slug } = await params;
  const marca = await marcaPorSlug(slug);
  if (!marca) return { title: 'Marca no encontrada' };

  const total = (await todasLasMotos()).filter((m) => m.marca === marca).length;
  return {
    title: `Motos ${marca}`,
    description: `${total} modelos ${marca} en CARRI Motos. Mirá el catálogo y consultá precio y disponibilidad.`,
    alternates: { canonical: `/catalogo/marca/${slug}` },
  };
}

export default async function MarcaPage({ params }: Props) {
  const { marca: slug } = await params;
  const marca = await marcaPorSlug(slug);
  if (!marca) notFound();

  const total = (await todasLasMotos()).filter((m) => m.marca === marca).length;

  return (
    <VistaCatalogo
      titulo={`Motos ${marca}`}
      bajada={`${total} ${total === 1 ? 'modelo' : 'modelos'} ${marca} en nuestro catálogo. Entrá en la ficha de cada uno para consultar precio y disponibilidad.`}
      filtroInicial={{ marca }}
      migas={[{ etiqueta: marca }]}
    />
  );
}
