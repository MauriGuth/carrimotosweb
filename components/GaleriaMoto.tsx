'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SinFoto } from './MotoImagen';
import type { Foto } from '@/data/fotos';

type Props = {
  fotos: Foto[];
  nombre: string;
  marca: string;
};

/** Distancia mínima de arrastre para que cuente como pasar de foto. */
const UMBRAL_DESLIZAR = 50;

/**
 * Galería de la ficha: foto grande, flechas, miniaturas y contador.
 * Se puede pasar de foto con las flechas, con el teclado o deslizando.
 * Con una sola foto no muestra nada de eso, y sin ninguna cae al placeholder.
 */
export default function GaleriaMoto({ fotos, nombre, marca }: Props) {
  const [activa, setActiva] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const inicioX = useRef<number | null>(null);

  const total = fotos.length;

  const ir = useCallback(
    (paso: number) => {
      // El resto negativo en JS da negativo, así que se suma total antes.
      setActiva((i) => (i + paso + total) % total);
    },
    [total],
  );

  // Flechas del teclado, sólo cuando el foco está dentro de la galería.
  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo || total < 2) return;

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ir(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        ir(1);
      }
    };

    nodo.addEventListener('keydown', alTeclear);
    return () => nodo.removeEventListener('keydown', alTeclear);
  }, [ir, total]);

  if (!total) {
    return (
      <div className="relative aspect-4/3 self-start overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
        <SinFoto marca={marca} nombre={nombre} className="h-full w-full" />
      </div>
    );
  }

  const variasFotos = total > 1;

  return (
    <div
      ref={contenedor}
      className="self-start focus:outline-none"
      tabIndex={variasFotos ? 0 : -1}
      role={variasFotos ? 'group' : undefined}
      aria-roledescription={variasFotos ? 'galería' : undefined}
      aria-label={variasFotos ? `Fotos de ${nombre}. Usá las flechas para pasar.` : undefined}
    >
      <div
        className="group relative aspect-4/3 touch-pan-y overflow-hidden rounded-2xl border border-ink-700 bg-ink-850"
        onTouchStart={(e) => {
          inicioX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (inicioX.current === null) return;
          const recorrido = e.changedTouches[0].clientX - inicioX.current;
          if (Math.abs(recorrido) > UMBRAL_DESLIZAR) ir(recorrido < 0 ? 1 : -1);
          inicioX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotos[activa].grande}
          alt={`${nombre} — foto ${activa + 1} de ${total}`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />

        {variasFotos && (
          <>
            <Flecha direccion="anterior" onClick={() => ir(-1)} />
            <Flecha direccion="siguiente" onClick={() => ir(1)} />

            <span className="titulo pointer-events-none absolute bottom-3 right-3 rounded bg-ink-950/80 px-2.5 py-1 text-[11px] tracking-wider text-mist-200 backdrop-blur-sm">
              {activa + 1} / {total}
            </span>
          </>
        )}
      </div>

      {variasFotos && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {fotos.map((foto, i) => (
            <button
              key={foto.grande}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === activa}
              className={`aspect-square overflow-hidden rounded-lg border transition-all ${
                i === activa ? 'border-carri opacity-100' : 'border-ink-700 opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.mini} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Flecha({ direccion, onClick }: { direccion: 'anterior' | 'siguiente'; onClick: () => void }) {
  const esAnterior = direccion === 'anterior';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={esAnterior ? 'Foto anterior' : 'Foto siguiente'}
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink-950/60 text-mist-50 backdrop-blur-sm transition-all hover:bg-carri active:scale-95 ${
        esAnterior ? 'left-3' : 'right-3'
      } ${
        // En pantallas con mouse aparecen al pasar por encima; en touch, siempre.
        'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d={esAnterior ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
      </svg>
    </button>
  );
}
