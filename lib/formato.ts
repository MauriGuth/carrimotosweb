const PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function precio(valor: number): string {
  return PESOS.format(valor);
}

/**
 * Pasa un texto en MAYÚSCULAS de la planilla a algo legible,
 * respetando siglas y números de modelo (CBS, 150, R/T, 4V...).
 */
export function capitalizar(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map((palabra) => {
      if (!palabra) return palabra;
      if (/\d/.test(palabra)) return palabra.toUpperCase();
      if (palabra.length <= 3) return palabra.toUpperCase();
      return palabra[0].toUpperCase() + palabra.slice(1);
    })
    .join(' ');
}
