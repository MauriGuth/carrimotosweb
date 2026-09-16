import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Easing de todas las entradas: arranca rápido y frena suave (expo out). */
export const EASE = 'expo.out';
export const DURACION = 0.7;
export const ESCALONADO = 0.08;

let registrado = false;

/**
 * Registra ScrollTrigger una sola vez y sólo en el navegador.
 * Devuelve gsap ya listo para usar.
 */
export function prepararGsap() {
  if (!registrado && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registrado = true;
  }
  return gsap;
}
