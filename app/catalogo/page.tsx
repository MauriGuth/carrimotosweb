import type { Metadata } from 'next';
import VistaCatalogo from '@/components/VistaCatalogo';
import { MOTOS } from '@/data/motos';
import { marcasConConteo } from '@/lib/catalogo';

export const metadata: Metadata = {
  title: 'Catálogo de motos 0km',
  description:
    'Todos los modelos de CARRI Motos: económicas, calle, scooters, enduro, touring, custom y más. Filtrá por marca, categoría y cilindrada.',
  alternates: { canonical: '/catalogo' },
};

export default function CatalogoPage() {
  return (
    <VistaCatalogo
      titulo="Catálogo"
      bajada={`${MOTOS.length} modelos de ${marcasConConteo().length} marcas. Filtrá y entrá en la ficha de cada moto para consultar precio y disponibilidad.`}
    />
  );
}
