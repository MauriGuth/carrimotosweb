'use client';

import { useCallback, useState } from 'react';

type Props = {
  slug: string;
  nombre: string;
  marca: string;
  className?: string;
  /** Las imágenes destacadas cargan de entrada, el resto en diferido. */
  prioridad?: boolean;
};

/**
 * Muestra la foto del modelo si existe en /public/motos/<slug>.jpg.
 * Mientras no haya foto cargada, muestra un placeholder con la marca,
 * así el catálogo se ve completo desde el primer día.
 */
export default function MotoImagen({ slug, nombre, marca, className = '', prioridad = false }: Props) {
  const [falló, setFalló] = useState(false);

  // Si la imagen ya falló antes de que React hidratara la página, el evento
  // onError se pierde. Lo detectamos al montar mirando el estado del <img>.
  const alMontar = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setFalló(true);
  }, []);

  if (falló) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-ink-800 diagonales ${className}`}
        role="img"
        aria-label={`${nombre} — foto no disponible`}
      >
        <svg viewBox="0 0 64 34" className="w-1/2 max-w-[120px] text-ink-600" fill="currentColor" aria-hidden="true">
          <path d="M12 34a12 12 0 1 1 0-24 12 12 0 0 1 0 24Zm0-5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm40 5a12 12 0 1 1 0-24 12 12 0 0 1 0 24Zm0-5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM38.7 4l2.6 5H49l2.2 4.3-6.6 1.6-4.1-2.6-6.6 7.9H22l-4.4 3.1-2.6-4 6-4.3h9.6l4.2-5.1-3.5-2.2-6.9 1.6-1-4.4L32 3h4.1l-1.4-3H29V0h9.7l3 4h-3Z" />
        </svg>
        <span className="titulo text-[11px] tracking-widest text-mist-500">{marca}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={alMontar}
      src={`/motos/${slug}.jpg`}
      alt={nombre}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFalló(true)}
      className={`object-contain ${className}`}
    />
  );
}
