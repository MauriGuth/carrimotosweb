import { CATEGORIAS, MOTOS, type CategoriaSlug, type Moto } from '@/data/motos';

/** Marcas con su cantidad de modelos, ordenadas por cantidad. */
export function marcasConConteo(): { marca: string; total: number }[] {
  const mapa = new Map<string, number>();
  for (const m of MOTOS) mapa.set(m.marca, (mapa.get(m.marca) ?? 0) + 1);
  return [...mapa.entries()]
    .map(([marca, total]) => ({ marca, total }))
    .sort((a, b) => b.total - a.total || a.marca.localeCompare(b.marca));
}

/** Categorías que efectivamente tienen modelos, en orden de catálogo. */
export function categoriasConConteo(): { slug: CategoriaSlug; nombre: string; descripcion: string; total: number }[] {
  const orden: CategoriaSlug[] = [
    'economicas',
    'calle',
    'scooter',
    'enduro',
    'touring',
    'custom',
    'ninos',
    'utilitario',
  ];
  return orden
    .map((slug) => ({
      ...CATEGORIAS[slug],
      total: MOTOS.filter((m) => m.categoria === slug).length,
    }))
    .filter((c) => c.total > 0);
}

export function motoPorSlug(slug: string): Moto | undefined {
  return MOTOS.find((m) => m.slug === slug);
}

/** Modelos parecidos para mostrar al pie de la ficha. */
export function motosRelacionadas(moto: Moto, cantidad = 4): Moto[] {
  const puntaje = (otra: Moto) => {
    let p = 0;
    if (otra.marca === moto.marca) p += 3;
    if (otra.categoria === moto.categoria) p += 2;
    if (moto.cilindrada && otra.cilindrada) {
      const dif = Math.abs(otra.cilindrada - moto.cilindrada);
      if (dif <= 50) p += 2;
      else if (dif <= 150) p += 1;
    }
    return p;
  };

  return MOTOS.filter((m) => m.slug !== moto.slug)
    .map((m) => ({ m, p: puntaje(m) }))
    .filter(({ p }) => p > 0)
    .sort((a, b) => b.p - a.p || a.m.nombre.localeCompare(b.m.nombre))
    .slice(0, cantidad)
    .map(({ m }) => m);
}

/** Selección para la home: primero lo que hay en stock. */
export function motosDestacadas(cantidad = 8): Moto[] {
  const enStock = MOTOS.filter((m) => m.enStock);
  const resto = MOTOS.filter((m) => !m.enStock && m.cilindrada !== null);
  return [...enStock, ...resto].slice(0, cantidad);
}

/** Texto corto con lo que sabemos del modelo, para la tarjeta y los metadatos. */
export function resumenMoto(moto: Moto): string {
  const partes: string[] = [];
  if (moto.cilindrada) partes.push(`${moto.cilindrada}cc`);
  partes.push(CATEGORIAS[moto.categoria].nombre);
  if (moto.altaGama) partes.push('Alta gama');
  return partes.join(' · ');
}

/** Convierte una marca en slug de URL: "MOTO MORINI" → "moto-morini". */
export function slugMarca(marca: string): string {
  return marca
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Busca la marca a partir de su slug. undefined si no existe. */
export function marcaPorSlug(slug: string): string | undefined {
  return MOTOS.find((m) => slugMarca(m.marca) === slug)?.marca;
}
