'use client';

import { useState } from 'react';
import { SinFoto } from './MotoImagen';

type Props = {
  fotos: string[];
  nombre: string;
  marca: string;
};

/**
 * Galería de la ficha: foto grande y tira de miniaturas.
 * Con una sola foto no muestra miniaturas, y sin ninguna cae al placeholder.
 */
export default function GaleriaMoto({ fotos, nombre, marca }: Props) {
  const [activa, setActiva] = useState(0);

  if (!fotos.length) {
    return (
      <div className="relative aspect-4/3 self-start overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
        <SinFoto marca={marca} nombre={nombre} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="self-start">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotos[activa]}
          alt={`${nombre} — foto ${activa + 1} de ${fotos.length}`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />

        {fotos.length > 1 && (
          <span className="titulo absolute bottom-3 right-3 rounded bg-ink-950/80 px-2.5 py-1 text-[11px] tracking-wider text-mist-200 backdrop-blur-sm">
            {activa + 1} / {fotos.length}
          </span>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6" role="group" aria-label={`Fotos de ${nombre}`}>
          {fotos.map((foto, i) => (
            <button
              key={foto}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
              aria-current={i === activa}
              className={`aspect-square overflow-hidden rounded-lg border transition-all ${
                i === activa
                  ? 'border-carri opacity-100'
                  : 'border-ink-700 opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
