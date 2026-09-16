'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURACION, EASE, prepararGsap } from '@/lib/animacion';

const useEfectoVisual = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Cambiá este valor cuando cambie el contenido (por ejemplo, al filtrar). */
  clave?: string | number;
};

/**
 * Igual que Revelar con escalonado, pero pensado para grillas largas: el
 * catálogo tiene 185 tarjetas y crear un ScrollTrigger por cada una es caro.
 * ScrollTrigger.batch agrupa las que entran juntas en pantalla y las anima de
 * a tandas, con un solo observer.
 */
export default function RevelarGrilla({ children, className, clave }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEfectoVisual(() => {
    const gsap = prepararGsap();
    const nodo = ref.current;
    if (!nodo) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tarjetas = Array.from(nodo.children) as HTMLElement[];
      if (!tarjetas.length) return;

      gsap.set(tarjetas, { opacity: 0, y: 24 });

      const lotes = ScrollTrigger.batch(tarjetas, {
        start: 'top 92%',
        once: true,
        onEnter: (elementos) =>
          gsap.to(elementos, {
            opacity: 1,
            y: 0,
            duration: DURACION,
            ease: EASE,
            stagger: 0.06,
            overwrite: true,
          }),
      });

      return () => {
        lotes.forEach((lote) => lote.kill());
        // Si se desmonta a mitad de camino, que no quede nada escondido.
        gsap.set(tarjetas, { clearProps: 'opacity,transform' });
      };
    });

    return () => mm.revert();
  }, [clave]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
