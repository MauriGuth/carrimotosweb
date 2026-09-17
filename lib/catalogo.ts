import { CATEGORIAS, MOTOS, type CategoriaSlug, type Moto } from '@/data/motos';
import { FOTOS, type Foto } from '@/data/fotos';
import { FICHAS } from '@/data/fichas';
import { CAMPOS_FICHA, type FichaTecnica } from '@/data/campos-ficha';

/**
 * ──────────────────────────────────────────────────────────────────────────
 *  DE DÓNDE SALE EL CATÁLOGO
 *
 *  De Nova, si están cargadas NOVA_API_URL y NOVA_CATALOG_TOKEN. Ahí el
 *  cliente maneja sus modelos, fotos y fichas desde el panel, y el sitio
 *  muestra lo que haya en el momento de armar la página.
 *
 *  Si esas variables no están, sale de los archivos generados que viven en el
 *  repo (data/motos.ts y compañía), que es como venía funcionando.
 *
 *  El respaldo no es por las dudas: es lo que hace que este cambio se pueda
 *  desplegar ANTES de migrar los datos a Nova sin que el sitio cambie en nada.
 *  Cuando la migración esté hecha se cargan las dos variables en Vercel y el
 *  sitio pasa a leer de Nova; si algo sale mal, se sacan y vuelve atrás sin
 *  necesidad de desplegar nada.
 * ──────────────────────────────────────────────────────────────────────────
 */

/** Cada cuánto se vuelve a preguntar el catálogo. */
const SEGUNDOS_DE_CACHE = 60;

/** Un modelo como lo consume el sitio: lo del catálogo más su foto de tarjeta. */
export type MotoWeb = Moto & {
  /** Foto chica para la tarjeta. null = se muestra el placeholder con la marca. */
  miniatura: string | null;
  /**
   * Texto libre que el cliente escribe en el panel y sale en la ficha de la
   * moto. Solo existe si el catálogo sale de Nova; los archivos del repo no
   * tienen descripciones.
   */
  descripcion: string | null;
  /**
   * La cinta de promo que le toca a esta moto, ya resuelta. Se calcula una vez
   * al armar el catálogo en vez de recorrer todas las promos por cada tarjeta.
   */
  cinta: string | null;
};

/** Una promo publicada en Nova. La API ya filtra las que no están vigentes. */
export type Promo = {
  slug: string;
  titulo: string;
  bajada: string | null;
  texto: string | null;
  /** Lo que va sobre la foto en el catálogo. null = esta promo no pone cinta. */
  cinta: string | null;
  /** El número, tal cual lo escribió el cliente: "12 cuotas sin interés". */
  destacado: string | null;
  imagen: string | null;
  miniatura: string | null;
  hasta: string | null;
  /** Slugs de las motos que entran. Vacío = campaña general, para toda la web. */
  modelos: string[];
};

export type Catalogo = {
  motos: MotoWeb[];
  fotos: Record<string, Foto[]>;
  fichas: Record<string, FichaTecnica>;
  promos: Promo[];
  /** De dónde salieron los datos. Se loguea en el build para no adivinar. */
  origen: 'nova' | 'repo';
};

/* ---------------------------------------------------------------- */
/* Lo que manda Nova                                                 */
/* ---------------------------------------------------------------- */

type ModeloDeNova = {
  slug: string;
  nombre: string;
  marca: string;
  cilindrada: number | null;
  categoria: string;
  premium: boolean;
  descripcion: string | null;
  enStock: boolean;
  colores: string[];
  ficha: { etiqueta: string; valor: string }[];
  fotos: { grande: string; mini: string }[];
  /** Slugs de las promos vigentes que incluyen esta moto. */
  promos?: string[];
};

/** Las etiquetas que manda Nova, de vuelta a las claves que usa la ficha. */
const CLAVE_POR_ETIQUETA = new Map<string, string>(
  CAMPOS_FICHA.map((c) => [c.etiqueta, c.clave] as [string, string]),
);

const ES_CATEGORIA = new Set<string>(Object.keys(CATEGORIAS));

/**
 * Saca del nombre el prefijo de la marca: "HONDA XR 150L" → "XR 150L". Es lo
 * que se muestra en grande en la tarjeta y en la ficha, con la marca al lado.
 */
function modeloDe(nombre: string, marca: string): string {
  const limpio = nombre.trim();
  const prefijo = `${marca.trim()} `;
  return limpio.toUpperCase().startsWith(prefijo.toUpperCase())
    ? limpio.slice(prefijo.length).trim() || limpio
    : limpio;
}

function desdeNova(modelos: ModeloDeNova[], promos: Promo[]): Catalogo {
  // La cinta de cada moto: la primera promo que la incluya y traiga cinta.
  // Si una moto cae en dos promos con cinta gana la de arriba en Nova, que es
  // el orden en el que vienen.
  const cintaPorModelo = new Map<string, string>();
  for (const promo of promos) {
    if (!promo.cinta) continue;
    for (const slug of promo.modelos) {
      if (!cintaPorModelo.has(slug)) cintaPorModelo.set(slug, promo.cinta);
    }
  }

  const motos: MotoWeb[] = [];
  const fotos: Record<string, Foto[]> = {};
  const fichas: Record<string, FichaTecnica> = {};

  for (const m of modelos) {
    // Una categoría que el sitio no conoce no puede tirar abajo el build: la
    // moto entra igual, en Calle, y se corrige desde Nova.
    const categoria = (ES_CATEGORIA.has(m.categoria) ? m.categoria : 'calle') as CategoriaSlug;

    motos.push({
      slug: m.slug,
      marca: m.marca,
      modelo: modeloDe(m.nombre, m.marca),
      nombre: m.nombre,
      cilindrada: m.cilindrada,
      categoria,
      colores: m.colores ?? [],
      enStock: m.enStock,
      altaGama: m.premium,
      miniatura: m.fotos[0]?.mini ?? null,
      descripcion: m.descripcion?.trim() || null,
      cinta: cintaPorModelo.get(m.slug) ?? null,
    });

    if (m.fotos.length) {
      fotos[m.slug] = m.fotos.map((f) => ({ grande: f.grande, mini: f.mini }));
    }

    const ficha: Record<string, string> = {};
    for (const campo of m.ficha ?? []) {
      const clave = CLAVE_POR_ETIQUETA.get(campo.etiqueta);
      if (clave && campo.valor) ficha[clave] = campo.valor;
    }
    if (Object.keys(ficha).length) fichas[m.slug] = ficha as FichaTecnica;
  }

  return { motos, fotos, fichas, promos, origen: 'nova' };
}

/** El catálogo de los archivos del repo, que es como venía funcionando. */
function desdeElRepo(): Catalogo {
  return {
    motos: MOTOS.map((m) => ({
      ...m,
      miniatura: FOTOS[m.slug]?.[0]?.mini ?? null,
      descripcion: null,
      cinta: null,
    })),
    fotos: FOTOS,
    fichas: FICHAS,
    // Las promos viven solo en Nova: sin Nova no hay promos que mostrar.
    promos: [],
    origen: 'repo',
  };
}

/* ---------------------------------------------------------------- */
/* El catálogo                                                       */
/* ---------------------------------------------------------------- */

let enCurso: Promise<Catalogo> | null = null;

/**
 * El catálogo entero. Se pide una sola vez por render aunque lo llamen diez
 * componentes, y Next lo cachea `SEGUNDOS_DE_CACHE` entre renders.
 */
export function obtenerCatalogo(): Promise<Catalogo> {
  if (!enCurso) {
    enCurso = cargar().finally(() => {
      // Se suelta en el próximo tick: dentro del mismo render todos comparten
      // la promesa, pero un render posterior vuelve a preguntar.
      setTimeout(() => {
        enCurso = null;
      }, 0);
    });
  }
  return enCurso;
}

async function cargar(): Promise<Catalogo> {
  const api = process.env.NOVA_API_URL?.replace(/\/+$/, '');
  const token = process.env.NOVA_CATALOG_TOKEN;
  if (!api || !token) return desdeElRepo();

  try {
    const res = await fetch(`${api}/public-web-catalog/${token}`, {
      next: { revalidate: SEGUNDOS_DE_CACHE },
    });
    if (!res.ok) throw new Error(`la API respondió ${res.status}`);

    const datos = (await res.json()) as { modelos?: ModeloDeNova[]; promos?: Promo[] };
    if (!Array.isArray(datos.modelos) || datos.modelos.length === 0) {
      throw new Error('el catálogo vino vacío');
    }
    // Las promos son opcionales a propósito: una API todavía sin el módulo
    // devuelve el catálogo igual y el sitio anda, sin promos.
    return desdeNova(datos.modelos, Array.isArray(datos.promos) ? datos.promos : []);
  } catch (e) {
    // Con la API caída el sitio sigue en pie con lo último que quedó en el
    // repo, en vez de publicar un catálogo vacío o romper el build.
    console.warn(
      `[catálogo] No se pudo leer de Nova (${(e as Error).message}). ` +
        `Se usa el catálogo del repo.`,
    );
    return desdeElRepo();
  }
}

/* ---------------------------------------------------------------- */
/* Consultas                                                         */
/* ---------------------------------------------------------------- */

/**
 * Marcas con su cantidad de modelos, ordenadas por cantidad.
 *
 * Vienen con el slug hecho para que nadie tenga que volver a calcularlo: así
 * los componentes de cliente arman los links a /catalogo/marca/... sin
 * importar este módulo, que se trae el catálogo entero atrás.
 */
export async function marcasConConteo(): Promise<{ marca: string; slug: string; total: number }[]> {
  const { motos } = await obtenerCatalogo();
  const mapa = new Map<string, number>();
  for (const m of motos) mapa.set(m.marca, (mapa.get(m.marca) ?? 0) + 1);
  return [...mapa.entries()]
    .map(([marca, total]) => ({ marca, slug: slugMarca(marca), total }))
    .sort((a, b) => b.total - a.total || a.marca.localeCompare(b.marca));
}

/** Categorías que efectivamente tienen modelos, en orden de catálogo. */
export async function categoriasConConteo(): Promise<
  { slug: CategoriaSlug; nombre: string; descripcion: string; total: number }[]
> {
  const { motos } = await obtenerCatalogo();
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
      total: motos.filter((m) => m.categoria === slug).length,
    }))
    .filter((c) => c.total > 0);
}

export async function todasLasMotos(): Promise<MotoWeb[]> {
  return (await obtenerCatalogo()).motos;
}

export async function motoPorSlug(slug: string): Promise<MotoWeb | undefined> {
  const { motos } = await obtenerCatalogo();
  return motos.find((m) => m.slug === slug);
}

export async function fotosDe(slug: string): Promise<Foto[]> {
  const { fotos } = await obtenerCatalogo();
  return fotos[slug] ?? [];
}

export async function fichaDe(slug: string): Promise<FichaTecnica> {
  const { fichas } = await obtenerCatalogo();
  return fichas[slug] ?? {};
}

/** Modelos parecidos para mostrar al pie de la ficha. */
export async function motosRelacionadas(moto: MotoWeb, cantidad = 4): Promise<MotoWeb[]> {
  const { motos } = await obtenerCatalogo();
  const puntaje = (otra: MotoWeb) => {
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

  return motos
    .filter((m) => m.slug !== moto.slug)
    .map((m) => ({ m, p: puntaje(m) }))
    .filter(({ p }) => p > 0)
    .sort((a, b) => b.p - a.p || a.m.nombre.localeCompare(b.m.nombre))
    .slice(0, cantidad)
    .map(({ m }) => m);
}

/** Selección para la home: primero lo que hay en el local. */
export async function motosDestacadas(cantidad = 8): Promise<MotoWeb[]> {
  const { motos } = await obtenerCatalogo();
  const enStock = motos.filter((m) => m.enStock);
  const resto = motos.filter((m) => !m.enStock && m.cilindrada !== null);
  return [...enStock, ...resto].slice(0, cantidad);
}

/* ---------------------------------------------------------------- */
/* Promos                                                            */
/* ---------------------------------------------------------------- */

/**
 * Las promos que se están viendo. La vigencia la resuelve Nova: si una promo
 * venció o está apagada, directamente no viene.
 */
export async function promosVigentes(): Promise<Promo[]> {
  const { promos } = await obtenerCatalogo();
  return promos;
}

/** Las promos que incluyen a esta moto. */
export async function promosDe(slug: string): Promise<Promo[]> {
  const { promos } = await obtenerCatalogo();
  return promos.filter((p) => p.modelos.includes(slug));
}

/** Una promo por su dirección. undefined si no existe o ya no está vigente. */
export async function promoPorSlug(slug: string): Promise<Promo | undefined> {
  const { promos } = await obtenerCatalogo();
  return promos.find((p) => p.slug === slug);
}

/** Las motos que entran en una promo, en el orden del catálogo. */
export async function motosDeLaPromo(promo: Promo): Promise<MotoWeb[]> {
  const { motos } = await obtenerCatalogo();
  const enLaPromo = new Set(promo.modelos);
  return motos.filter((m) => enLaPromo.has(m.slug));
}

/* ---------------------------------------------------------------- */
/* Puras: no dependen del catálogo                                   */
/* ---------------------------------------------------------------- */

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
export async function marcaPorSlug(slug: string): Promise<string | undefined> {
  const { motos } = await obtenerCatalogo();
  return motos.find((m) => slugMarca(m.marca) === slug)?.marca;
}
