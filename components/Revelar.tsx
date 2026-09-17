'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { DURACION, EASE, ESCALONADO, prepararGsap } from '@/lib/animacion';

// useLayoutEffect avisa en el servidor; en el navegador es el que evita el
// parpadeo, porque corre antes de que se pinte.
const useEfectoVisual = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Props = {
  children: React.ReactNode;
  /** Anima los hijos directos escalonados en vez del bloque entero. */
  escalonar?: boolean;
  /** Cuántos píxeles sube al aparecer. */
  y?: number;
  /** Retraso inicial, en segundos. */
  retraso?: number;
  /** Agrega un leve zoom, para tarjetas. */
  escala?: boolean;
  /** Anima apenas carga, sin esperar al scroll. Para lo que ya está en pantalla. */
  inmediato?: boolean;
  className?: string;
};

/**
 * Revela su contenido cuando entra en pantalla.
 *
 * Usa gsap.from, así que el estado escondido lo pone JavaScript: si el script
 * no carga, el contenido simplemente se ve, sin animación. Y con
 * `prefers-reduced-motion` activado no se anima nada (gsap.matchMedia).
 */
export default function Revelar({
  children,
  escalonar = false,
  y = 28,
  retraso = 0,
  escala = false,
  inmediato = false,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEfectoVisual(() => {
    const gsap = prepararGsap();
    const nodo = ref.current;
    if (!nodo) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const objetivos = escalonar ? Array.from(nodo.children) : [nodo];
      if (!objetivos.length) return;

      // Se usa fromTo y no from a propósito. `from` toma el estado actual como
      // destino: si el efecto vuelve a correr sobre un elemento que quedó en
      // opacity 0, el nuevo tween anima de 0 a 0 y el contenido no aparece
      // nunca. Con fromTo los dos extremos están escritos, así que el destino
      // siempre es visible por más veces que se cree la animación.
      gsap.fromTo(
        objetivos,
        {
          opacity: 0,
          y,
          ...(escala ? { scale: 0.94 } : {}),
        },
        {
          opacity: 1,
          y: 0,
          ...(escala ? { scale: 1 } : {}),
          duration: DURACION,
          ease: EASE,
          delay: retraso,
          stagger: escalonar ? ESCALONADO : 0,
          overwrite: 'auto',
          // Al terminar se borran las propiedades que puso la animación. Un
          // transform residual crea un contenedor para los elementos `fixed`
          // que estén adentro, y eso rompe cualquier modal o visor.
          clearProps: 'opacity,transform',
          ...(inmediato
            ? {}
            : { scrollTrigger: { trigger: nodo, start: 'top 85%', once: true } }),
        },
      );
    });

    return () => {
      mm.revert();
      // Red de seguridad: si algo se desmonta a mitad de la animación, que el
      // contenido quede visible y no en el estado inicial escondido.
      const objetivos = escalonar ? Array.from(nodo.children) : [nodo];
      gsap.set(objetivos, { clearProps: 'opacity,transform' });
    };
  }, [escalonar, y, retraso, escala, inmediato]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
