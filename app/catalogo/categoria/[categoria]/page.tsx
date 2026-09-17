import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import VistaCatalogo from '@/components/VistaCatalogo';
import { CATEGORIAS, type CategoriaSlug } from '@/data/motos';
import { categoriasConConteo, todasLasMotos } from '@/lib/catalogo';

type Props = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  return (await categoriasConConteo()).map((c) => ({ categoria: c.slug }));
}

async function buscarCategoria(slug: string) {
  return (await categoriasConConteo()).find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = await buscarCategoria(slug);
  if (!categoria) return { title: 'Categoría no encontrada' };

  return {
    title: `Motos ${categoria.nombre}`,
    description: `${categoria.descripcion} ${categoria.total} modelos en CARRI Motos.`,
    alternates: { canonical: `/catalogo/categoria/${slug}` },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria: slug } = await params;
  const categoria = await buscarCategoria(slug);
  if (!categoria) notFound();

  const total = (await todasLasMotos()).filter((m) => m.categoria === (slug as CategoriaSlug))
    .length;

  return (
    <VistaCatalogo
      titulo={CATEGORIAS[slug as CategoriaSlug].nombre}
      bajada={`${categoria.descripcion} ${total} ${total === 1 ? 'modelo' : 'modelos'} disponibles.`}
      filtroInicial={{ categoria: slug as CategoriaSlug }}
      migas={[{ etiqueta: categoria.nombre }]}
    />
  );
}
