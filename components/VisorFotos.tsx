'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Foto } from '@/data/fotos';

type Props = {
  fotos: Foto[];
  activa: number;
  nombre: string;
  onCambiar: (i: number) => void;
  onCerrar: () => void;
};

const UMBRAL_DESLIZAR = 50;

/**
 * Visor a pantalla completa: se abre al tocar la foto de la ficha.
 *
 * A diferencia de la galería, acá la foto se muestra entera (object-contain)
 * en vez de recortada al encuadre: la idea es ver la moto completa y con el
 * mayor tamaño que entre en la pantalla.
 */
export default function VisorFotos({ fotos, activa, nombre, onCambiar, onCerrar }: Props) {
  const total = fotos.length;
  const cerrarRef = useRef<HTMLButtonElement>(null);
  // El portal sólo puede montarse en el navegador.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const abridorRef = useRef<Element | null>(null);
  const inicioX = useRef<number | null>(null);

  const ir = useCallback(
    (paso: number) => onCambiar((activa + paso + total) % total),
    [activa, total, onCambiar],
  );

  useEffect(() => {
    // Guardar quién abrió el visor para devolverle el foco al cerrar.
    abridorRef.current = document.activeElement;
    cerrarRef.current?.focus();

    // Bloquear el scroll de la página de atrás mientras el visor está abierto.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      else if (e.key === 'ArrowLeft') ir(-1);
      else if (e.key === 'ArrowRight') ir(1);
      else if (e.key === 'Tab') {
        // Mientras está abierto, el tabulado no se escapa del visor.
        const foco = document.querySelectorAll<HTMLElement>('[data-visor] button');
        if (!foco.length) return;
        const primero = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
      (abridorRef.current as HTMLElement | null)?.focus?.();
    };
  }, [ir, onCerrar]);

  if (!montado) return null;

  // Se monta en document.body a propósito. El visor es fixed y debe cubrir la
  // ventana entera, pero cualquier ancestro con transform —y GSAP deja uno al
  // animar la ficha— haría que fixed se posicione respecto de ese ancestro y
  // el visor quedaría encerrado dentro de la galería.
  return createPortal(
    <div
      data-visor
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nombre}`}
      // w-screen y no sólo inset-0: el sitio reserva el hueco de la barra de
      // scroll (scrollbar-gutter: stable) y ahí se colaba una franja del fondo.
      className="fixed inset-0 z-[60] flex w-screen flex-col bg-ink-950/96 backdrop-blur-sm"
      // Un clic en el fondo cierra; en la foto o los botones, no.
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="titulo text-sm tracking-wider text-mist-200">
          {activa + 1} <span className="text-mist-500">/ {total}</span>
        </span>
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-11 w-11 place-items-center rounded-full bg-ink-850 text-mist-100 transition-colors hover:bg-carri hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCerrar();
        }}
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
          className="max-h-full max-w-full object-contain"
          decoding="async"
        />

        {total > 1 && (
          <>
            <BotonVisor direccion="anterior" onClick={() => ir(-1)} />
            <BotonVisor direccion="siguiente" onClick={() => ir(1)} />
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
          {fotos.map((foto, i) => (
            <button
              key={foto.grande}
              type="button"
              onClick={() => onCambiar(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === activa}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all ${
                i === activa ? 'border-carri opacity-100' : 'border-ink-700 opacity-50 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.mini} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

function BotonVisor({ direccion, onClick }: { direccion: 'anterior' | 'siguiente'; onClick: () => void }) {
  const esAnterior = direccion === 'anterior';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={esAnterior ? 'Foto anterior' : 'Foto siguiente'}
      className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-ink-850/80 text-mist-50 backdrop-blur-sm transition-all hover:bg-carri active:scale-95 ${
        esAnterior ? 'left-2 sm:left-4' : 'right-2 sm:right-4'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d={esAnterior ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
      </svg>
    </button>
  );
}
