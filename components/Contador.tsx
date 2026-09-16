'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { EASE, prepararGsap } from '@/lib/animacion';

const useEfectoVisual = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Número que cuenta desde 0 hasta su valor cuando entra en pantalla.
 * El valor final ya viene renderizado en el HTML, así que si el JavaScript no
 * corre —o si la persona pidió menos movimiento— se ve el número directo.
 */
export default function Contador({ valor, className }: { valor: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEfectoVisual(() => {
    const gsap = prepararGsap();
    const nodo = ref.current;
    if (!nodo) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const contador = { n: 0 };
      gsap.to(contador, {
        n: valor,
        duration: 1.6,
        ease: EASE,
        onUpdate: () => {
          nodo.textContent = String(Math.round(contador.n));
        },
        scrollTrigger: { trigger: nodo, start: 'top 90%', once: true },
      });
    });

    return () => mm.revert();
  }, [valor]);

  return (
    <span ref={ref} className={className}>
      {valor}
    </span>
  );
}
