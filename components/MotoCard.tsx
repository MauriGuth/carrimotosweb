import Link from 'next/link';
import MotoImagen from './MotoImagen';
import { CATEGORIAS, type Moto } from '@/data/motos';
import { capitalizar } from '@/lib/formato';

export default function MotoCard({ moto, prioridad = false }: { moto: Moto; prioridad?: boolean }) {
  return (
    <Link
      href={`/moto/${moto.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-850 transition-all hover:-translate-y-1 hover:border-carri/60 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-ink-800">
        <MotoImagen
          slug={moto.slug}
          nombre={moto.nombre}
          marca={moto.marca}
          prioridad={prioridad}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {moto.enStock && (
            <span className="titulo rounded bg-carri px-2 py-1 text-[10px] tracking-widest text-white">
              Entrega inmediata
            </span>
          )}
          {moto.altaGama && (
            <span className="titulo rounded bg-ink-950/80 px-2 py-1 text-[10px] tracking-widest text-mist-200 backdrop-blur-sm">
              Alta gama
            </span>
          )}
        </div>

        {moto.cilindrada && (
          <span className="titulo absolute bottom-3 right-3 rounded bg-ink-950/80 px-2 py-1 text-[11px] tracking-wider text-mist-200 backdrop-blur-sm">
            {moto.cilindrada}cc
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="titulo text-[11px] tracking-[0.18em] text-carri">{moto.marca}</p>
        <h3 className="titulo text-base leading-snug text-mist-50">{capitalizar(moto.modelo)}</h3>
        <p className="text-xs text-mist-400">{CATEGORIAS[moto.categoria].nombre}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-sm font-semibold text-mist-200">Consultar precio</span>
          <span className="titulo flex items-center gap-1 text-xs tracking-wider text-carri transition-transform group-hover:translate-x-0.5">
            Ver ficha
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
