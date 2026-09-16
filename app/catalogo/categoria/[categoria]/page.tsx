import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import VistaCatalogo from '@/components/VistaCatalogo';
import { CATEGORIAS, MOTOS, type CategoriaSlug } from '@/data/motos';
import { categoriasConConteo } from '@/lib/catalogo';

type Props = { params: Promise<{ categoria: string }> };

export function generateStaticParams() {
  return categoriasConConteo().map((c) => ({ categoria: c.slug }));
}

function buscarCategoria(slug: string) {
  return categoriasConConteo().find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = buscarCategoria(slug);
  if (!categoria) return { title: 'Categoría no encontrada' };

  return {
    title: `Motos ${categoria.nombre}`,
    description: `${categoria.descripcion} ${categoria.total} modelos en CARRI Motos.`,
    alternates: { canonical: `/catalogo/categoria/${slug}` },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria: slug } = await params;
  const categoria = buscarCategoria(slug);
  if (!categoria) notFound();

  const total = MOTOS.filter((m) => m.categoria === (slug as CategoriaSlug)).length;

  return (
    <VistaCatalogo
      titulo={CATEGORIAS[slug as CategoriaSlug].nombre}
      bajada={`${categoria.descripcion} ${total} ${total === 1 ? 'modelo' : 'modelos'} disponibles.`}
      filtroInicial={{ categoria: slug as CategoriaSlug }}
      migas={[{ etiqueta: categoria.nombre }]}
    />
  );
}
