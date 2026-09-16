/**
 * Genera data/motos.ts y data/accesorios.ts a partir de scripts/catalogo.xlsx
 * (la planilla "PARA CARGAR SISTEMA" que usa el local).
 *
 * Uso:  npm run import:catalogo
 *
 * Importante: las columnas MOTOR y CUADRO de la planilla son números de motor y
 * de chasis de unidades físicas. Son datos internos de stock y NO se exportan a
 * la web: sólo se usan para marcar qué modelos hay disponibles en el local.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const XLSX_PATH = path.join(__dirname, 'catalogo.xlsx');

/* ------------------------------------------------------------------ */
/* Normalización de marcas                                             */
/* ------------------------------------------------------------------ */

/** Marcas que vienen escritas distinto en la planilla y hay que unificar. */
const MARCA_ALIAS = {
  'GILERA': 'GILERA',                 // en la planilla aparece con espacio al final
  'HONDA ALTA GAMA': 'HONDA',         // es la línea premium de Honda, no otra marca
  'KEEWAI': 'KEEWAY',                 // typo en la planilla
  'MOTOMORINI': 'MOTO MORINI',
  'RVM MOTOCICLETAS': 'RVM',
  'CF MOTO': 'CFMOTO',
};

/** Marcas cuyos modelos se marcan como alta gama. */
const MARCAS_ALTA_GAMA_ORIGEN = new Set(['HONDA ALTA GAMA']);

/** Anotaciones internas que hay que sacar del nombre del modelo. */
const NOTAS_INTERNAS = [/\(el que tenemos\)/gi];

/* ------------------------------------------------------------------ */
/* Categorías                                                          */
/* ------------------------------------------------------------------ */

/**
 * Reglas de categoría, evaluadas EN ORDEN (la primera que matchea gana).
 * Se comparan contra "MARCA MODELO" en mayúsculas.
 * Si ninguna matchea, cae en 'calle', que es la categoría más amplia.
 *
 * Para corregir la categoría de un modelo, agregá o movés una regla acá
 * y volvés a correr `npm run import:catalogo`.
 */
const REGLAS_CATEGORIA = [
  ['utilitario', /ARGENCARGO|\bUTV\b|PARA CARGA/],
  ['ninos', /MOTO NI[NÑ]O|KINDER|\bRR110\b|TXR (60|110|140)\b|TXR K2|PISTERA/],
  ['custom', /CHOPERA|INDIANA|IMPERIALE|LEONCINO|H NESS/],
  ['scooter', /SCOOTER|\bNAVI\b|FASCINO|NTORQ|STYLER|MODENA|OLTRE|SCOOBY/],
  // Las líneas enduro se evalúan antes que "ADVENTURE": una SKUA 250 ADVENTURE
  // sigue siendo una enduro, no una big trail.
  ['enduro', /SKUA|\bCX 150\b|\bXR ?\d|\bCRF\b|\bXTZ\b|\bSMX\b|RX Z\d|\bZR ?\d|TRIAX|TXR ?\d|TEKKEN|CROSS 250|390 ENDURO|\bKLX\b|TUNDRA|SAPUCAI|MIRACLE/],
  ['touring', /ADVENTURE|\bTRK\b|AFRICA|TENERE|X CAPE|ALLTRHIKE|RALLY|\bDS\b|\bDSX\b|\d{3}DS|DS \d{3}|\bNC 750\b|\bNX 500\b|X PULS|TOURER|DOMINAR|\bMT [46]50\b|\bT \d{3,4} ?V?X\b/],
  ['economicas', /BLITZ|\bWAVE/],
  ['economicas', /SMASH|\bZB\b|CLASSIC|ENERGY 110|\bTRIP\b|\bDUE\b|\bQU\b|NEO 110|\bLD 110\b|DAY 70|\bDX 70\b|\bECONO\b|TUNING 125|EXPERT 80/],
  ['calle', /.*/],
];

const CATEGORIAS = {
  economicas: { nombre: 'Económicas', descripcion: 'Motos de 110cc y 125cc para el día a día: bajo consumo y mantenimiento simple.' },
  calle: { nombre: 'Calle', descripcion: 'Nakeds y motos de calle para moverte todos los días por la ciudad y la ruta.' },
  scooter: { nombre: 'Scooters', descripcion: 'Automáticas, cómodas y prácticas. Ideales para la ciudad.' },
  enduro: { nombre: 'Enduro y Cross', descripcion: 'Motos preparadas para el off road, el campo y la competencia.' },
  touring: { nombre: 'Touring y Adventure', descripcion: 'Big trail y motos de viaje para hacer kilómetros con comodidad.' },
  custom: { nombre: 'Custom', descripcion: 'Choperas y motos de estilo retro para andar distinto.' },
  ninos: { nombre: 'Para chicos', descripcion: 'Motos y pit bikes pensadas para los más chicos.' },
  utilitario: { nombre: 'Utilitarias', descripcion: 'Vehículos de carga y trabajo.' },
};

function categoriaDe(marca, modelo) {
  const texto = `${marca} ${modelo}`.toUpperCase();
  for (const [cat, re] of REGLAS_CATEGORIA) {
    if (re.test(texto)) return cat;
  }
  return 'calle';
}

/* ------------------------------------------------------------------ */
/* Cilindrada                                                          */
/* ------------------------------------------------------------------ */

/**
 * Saca la cilindrada del nombre del modelo. Sólo usa los números que están
 * escritos en el nombre: si el modelo no la dice, queda en null y la web
 * simplemente no la muestra. No se inventan datos técnicos.
 */
function cilindradaDe(modelo) {
  const candidatos = (modelo.match(/\d+/g) || [])
    .map(Number)
    .filter((n) => n >= 49 && n <= 1300);
  if (!candidatos.length) return null;
  return Math.max(...candidatos);
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function limpiarModelo(raw, marca) {
  let m = String(raw).trim();
  for (const re of NOTAS_INTERNAS) m = m.replace(re, '');
  m = m.replace(/\s+/g, ' ').trim().toUpperCase();
  // En la planilla algunos modelos repiten la marca ("TVS" / "TVS NTORQ").
  const prefijo = `${marca.toUpperCase()} `;
  while (m.startsWith(prefijo) && m.length > prefijo.length) m = m.slice(prefijo.length).trim();
  return m;
}

function limpiarColor(raw) {
  if (!raw) return null;
  const c = String(raw).trim().toUpperCase().replace(/\s+/g, ' ');
  return c || null;
}

/* ------------------------------------------------------------------ */
/* MOTOS                                                               */
/* ------------------------------------------------------------------ */

function leerMotos(wb) {
  const ws = wb.Sheets['MOTOS'];
  const filas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

  const porSlug = new Map();
  let descartadas = 0;

  for (const fila of filas.slice(1)) {
    const marcaRaw = fila[0] ? String(fila[0]).trim().toUpperCase().replace(/\s+/g, ' ') : '';
    const modeloRaw = fila[1] ? String(fila[1]).trim() : '';
    if (!marcaRaw || !modeloRaw) {
      descartadas++;
      continue;
    }

    const marca = MARCA_ALIAS[marcaRaw] || marcaRaw;
    const altaGama = MARCAS_ALTA_GAMA_ORIGEN.has(marcaRaw);
    const modelo = limpiarModelo(modeloRaw, marca);
    const slug = slugify(`${marca} ${modelo}`);

    const color = limpiarColor(fila[2]);
    // fila[3] = MOTOR y fila[4] = CUADRO: datos internos, no se exportan.
    const tieneUnidad = Boolean(fila[3] || fila[4]);

    if (porSlug.has(slug)) {
      const existente = porSlug.get(slug);
      if (color && !existente.colores.includes(color)) existente.colores.push(color);
      existente.enStock = existente.enStock || tieneUnidad;
      continue;
    }

    porSlug.set(slug, {
      slug,
      marca,
      modelo,
      nombre: `${marca} ${modelo}`,
      cilindrada: cilindradaDe(modelo),
      categoria: categoriaDe(marca, modelo),
      colores: color ? [color] : [],
      enStock: tieneUnidad,
      altaGama,
    });
  }

  return { motos: [...porSlug.values()], descartadas };
}

/* ------------------------------------------------------------------ */
/* ACCESORIOS                                                          */
/* ------------------------------------------------------------------ */

function leerAccesorios(wb) {
  const ws = wb.Sheets['ACCESORIOS'];
  const filas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

  const grupos = [];
  let actual = null;

  for (const fila of filas) {
    const a = fila[0] ? String(fila[0]).trim() : '';
    const b = fila[1];
    if (!a) continue;
    if (a.toUpperCase() === 'ARTICULO') continue; // encabezado repetido

    const precio = typeof b === 'number' ? b : Number(String(b ?? '').replace(/[^\d]/g, '')) || null;

    if (precio === null) {
      // Fila sin precio => es el título de una categoría (CASCOS, GUANTES, ...).
      actual = { categoria: a.toUpperCase(), slug: slugify(a), items: [] };
      grupos.push(actual);
      continue;
    }

    if (!actual) {
      actual = { categoria: 'ACCESORIOS', slug: 'accesorios', items: [] };
      grupos.push(actual);
    }
    actual.items.push({ nombre: a.replace(/\s+/g, ' ').trim().toUpperCase(), precio });
  }

  return grupos.filter((g) => g.items.length > 0);
}

/* ------------------------------------------------------------------ */
/* Salida                                                              */
/* ------------------------------------------------------------------ */

const AVISO = `// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run import:catalogo  (fuente: scripts/catalogo.xlsx)
`;

function escribirMotos(motos) {
  const categoriasTs = Object.entries(CATEGORIAS)
    .map(([k, v]) => `  ${k}: { slug: '${k}', nombre: ${JSON.stringify(v.nombre)}, descripcion: ${JSON.stringify(v.descripcion)} },`)
    .join('\n');

  const motosTs = motos
    .map((m) => {
      const colores = m.colores.length ? `[${m.colores.map((c) => JSON.stringify(c)).join(', ')}]` : '[]';
      return `  { slug: ${JSON.stringify(m.slug)}, marca: ${JSON.stringify(m.marca)}, modelo: ${JSON.stringify(m.modelo)}, nombre: ${JSON.stringify(m.nombre)}, cilindrada: ${m.cilindrada ?? 'null'}, categoria: '${m.categoria}', colores: ${colores}, enStock: ${m.enStock}, altaGama: ${m.altaGama} },`;
    })
    .join('\n');

  const contenido = `${AVISO}
export type CategoriaSlug =
${Object.keys(CATEGORIAS).map((k) => `  | '${k}'`).join('\n')};

export type Categoria = {
  slug: CategoriaSlug;
  nombre: string;
  descripcion: string;
};

export type Moto = {
  slug: string;
  marca: string;
  modelo: string;
  nombre: string;
  /** Cilindrada en cc. null cuando el nombre del modelo no la indica. */
  cilindrada: number | null;
  categoria: CategoriaSlug;
  /** Colores vistos en la planilla de stock. */
  colores: string[];
  /** true si en la planilla figura al menos una unidad física del modelo. */
  enStock: boolean;
  altaGama: boolean;
};

export const CATEGORIAS: Record<CategoriaSlug, Categoria> = {
${categoriasTs}
};

export const MOTOS: Moto[] = [
${motosTs}
];
`;
  fs.writeFileSync(path.join(ROOT, 'data', 'motos.ts'), contenido);
}

function escribirAccesorios(grupos) {
  const gruposTs = grupos
    .map((g) => {
      const items = g.items
        .map((i) => `      { nombre: ${JSON.stringify(i.nombre)}, precio: ${i.precio} },`)
        .join('\n');
      return `  {
    slug: ${JSON.stringify(g.slug)},
    categoria: ${JSON.stringify(g.categoria)},
    items: [
${items}
    ],
  },`;
    })
    .join('\n');

  const contenido = `${AVISO}
export type Accesorio = {
  nombre: string;
  /** Precio en pesos, tal cual figura en la planilla. */
  precio: number;
};

export type GrupoAccesorios = {
  slug: string;
  categoria: string;
  items: Accesorio[];
};

export const ACCESORIOS: GrupoAccesorios[] = [
${gruposTs}
];
`;
  fs.writeFileSync(path.join(ROOT, 'data', 'accesorios.ts'), contenido);
}

/* ------------------------------------------------------------------ */

function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`No encuentro la planilla en ${XLSX_PATH}`);
    process.exit(1);
  }
  const wb = XLSX.read(fs.readFileSync(XLSX_PATH), { type: 'buffer' });

  const { motos, descartadas } = leerMotos(wb);
  const accesorios = leerAccesorios(wb);

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  escribirMotos(motos);
  escribirAccesorios(accesorios);

  const porCategoria = {};
  const sinCilindrada = [];
  for (const m of motos) {
    porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + 1;
    if (m.cilindrada === null) sinCilindrada.push(m.nombre);
  }

  console.log(`Motos:      ${motos.length} modelos (${new Set(motos.map((m) => m.marca)).size} marcas)`);
  console.log(`En stock:   ${motos.filter((m) => m.enStock).length} modelos con unidad cargada`);
  console.log(`Filas sin marca/modelo descartadas: ${descartadas}`);
  console.log('Por categoría:', porCategoria);
  console.log(`Accesorios: ${accesorios.reduce((n, g) => n + g.items.length, 0)} artículos en ${accesorios.length} rubros`);
  if (sinCilindrada.length) {
    console.log(`\nSin cilindrada en el nombre (${sinCilindrada.length}):`);
    for (const n of sinCilindrada) console.log(`  - ${n}`);
  }
}

main();
