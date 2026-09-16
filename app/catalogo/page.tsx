import { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogoCliente from '@/components/CatalogoCliente';
import { MOTOS } from '@/data/motos';
import { categoriasConConteo, marcasConConteo } from '@/lib/catalogo';

export const metadata: Metadata = {
  title: 'Catálogo de motos 0km',
  description:
    'Todos los modelos de CARRI Motos: económicas, calle, scooters, enduro, touring, custom y más. Filtrá por marca, categoría y cilindrada.',
};

export default function CatalogoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <h1 className="titulo text-3xl text-mist-50 sm:text-5xl">Catálogo</h1>
        <p className="mt-3 max-w-2xl text-sm text-mist-400 sm:text-base">
          {MOTOS.length} modelos de {marcasConConteo().length} marcas. Filtrá y entrá en la ficha de cada moto para
          consultar precio y disponibilidad por WhatsApp.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-mist-400">Cargando catálogo…</p>}>
        <CatalogoCliente motos={MOTOS} categorias={categoriasConConteo()} marcas={marcasConConteo()} />
      </Suspense>
    </div>
  );
}
