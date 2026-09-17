import type { Metadata } from 'next';
import VistaCatalogo from '@/components/VistaCatalogo';
import { marcasConConteo, todasLasMotos } from '@/lib/catalogo';

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

export const metadata: Metadata = {
  title: 'Catálogo de motos 0km',
  description:
    'Todos los modelos de CARRI Motos: económicas, calle, scooters, enduro, touring, custom y más. Filtrá por marca, categoría y cilindrada.',
  alternates: { canonical: '/catalogo' },
};

export default async function CatalogoPage() {
  const [motos, marcas] = await Promise.all([todasLasMotos(), marcasConConteo()]);
  return (
    <VistaCatalogo
      titulo="Catálogo"
      bajada={`${motos.length} modelos de ${marcas.length} marcas. Filtrá y entrá en la ficha de cada moto para consultar precio y disponibilidad.`}
    />
  );
}
