import { contactoDe, linkInstagram, type Sucursal } from '@/data/sucursales';

/** Arma el link de wa.me con el mensaje ya escrito. */
export function linkWhatsApp(whatsapp: string, mensaje: string): string {
  const numero = whatsapp.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function saludo(sucursal: Sucursal): string {
  const nombre = contactoDe(sucursal);
  return sucursal.vendedor ? `¡Hola ${nombre}!` : '¡Hola!';
}

export type Canal = {
  tipo: 'whatsapp' | 'instagram';
  url: string;
};

/**
 * Devuelve por dónde contactar a la sucursal: WhatsApp si el número está
 * cargado, y si no Instagram, que siempre funciona. Así ningún botón queda
 * apuntando a un número inexistente.
 */
export function canalDe(sucursal: Sucursal, mensaje: string): Canal {
  if (sucursal.whatsapp) {
    return { tipo: 'whatsapp', url: linkWhatsApp(sucursal.whatsapp, mensaje) };
  }
  return { tipo: 'instagram', url: linkInstagram(sucursal) };
}

/** Consulta general, sin un modelo puntual. */
export function consultaGeneral(sucursal: Sucursal): Canal {
  return canalDe(
    sucursal,
    `${saludo(sucursal)} Te escribo desde la web de CARRI Motos. Quería hacerles una consulta.`,
  );
}

/** Consulta por un modelo puntual del catálogo. */
export function consultaPorMoto(sucursal: Sucursal, moto: string): Canal {
  return canalDe(
    sucursal,
    `${saludo(sucursal)} Te escribo desde la web de CARRI Motos. Quería consultar precio y disponibilidad de la ${moto}.`,
  );
}

/** Consulta por un accesorio. */
export function consultaPorAccesorio(sucursal: Sucursal, accesorio: string): Canal {
  return canalDe(
    sucursal,
    `${saludo(sucursal)} Te escribo desde la web de CARRI Motos. Quería consultar por: ${accesorio}.`,
  );
}
