import type { Sucursal } from '@/data/sucursales';

/** Arma el link de wa.me con el mensaje ya escrito. */
export function linkWhatsApp(whatsapp: string, mensaje: string): string {
  const numero = whatsapp.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Consulta general, sin un modelo puntual. */
export function consultaGeneral(sucursal: Sucursal): string {
  return linkWhatsApp(
    sucursal.whatsapp,
    `¡Hola ${sucursal.vendedor}! Te escribo desde la web de CARRI Motos. Quería hacerles una consulta.`,
  );
}

/** Consulta por un modelo puntual del catálogo. */
export function consultaPorMoto(sucursal: Sucursal, moto: string): string {
  return linkWhatsApp(
    sucursal.whatsapp,
    `¡Hola ${sucursal.vendedor}! Te escribo desde la web de CARRI Motos. Quería consultar precio y disponibilidad de la ${moto}.`,
  );
}

/** Consulta por un accesorio. */
export function consultaPorAccesorio(sucursal: Sucursal, accesorio: string): string {
  return linkWhatsApp(
    sucursal.whatsapp,
    `¡Hola ${sucursal.vendedor}! Te escribo desde la web de CARRI Motos. Quería consultar por: ${accesorio}.`,
  );
}
