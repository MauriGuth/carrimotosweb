/**
 * Recorre public/motos y genera data/fotos.ts con la lista de fotos de cada
 * modelo. El navegador no puede leer el contenido de una carpeta, así que la
 * web necesita este índice para saber cuántas fotos tiene cada moto.
 *
 * Lo corre solo `npm run fotos`; también se puede correr suelto:
 *   npm run fotos:manifiesto
 *
 * Reconoce dos formas:
 *   public/motos/<slug>.jpg              → una sola foto
 *   public/motos/<slug>/1.jpg, 2.jpg …   → galería, en orden por nombre
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'public', 'motos');
const SALIDA = path.join(ROOT, 'data', 'fotos.ts');

const ES_IMAGEN = /\.(jpe?g|png|webp|avif)$/i;

/** Ordena 2.jpg antes que 10.jpg, que es lo que espera cualquiera. */
function porNumero(a, b) {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

function recolectar() {
  if (!fs.existsSync(DIR)) return {};
  const fotos = {};

  for (const entrada of fs.readdirSync(DIR, { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      const archivos = fs
        .readdirSync(path.join(DIR, entrada.name))
        .filter((f) => ES_IMAGEN.test(f))
        .sort(porNumero);
      if (archivos.length) {
        fotos[entrada.name] = archivos.map((f) => `/motos/${entrada.name}/${f}`);
      }
    } else if (ES_IMAGEN.test(entrada.name)) {
      const slug = entrada.name.replace(/\.[^.]+$/, '');
      fotos[slug] = [...(fotos[slug] ?? []), `/motos/${entrada.name}`];
    }
  }

  return fotos;
}

const fotos = recolectar();
const slugs = Object.keys(fotos).sort();

const cuerpo = slugs
  .map((s) => `  ${JSON.stringify(s)}: [${fotos[s].map((f) => JSON.stringify(f)).join(', ')}],`)
  .join('\n');

const contenido = `// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run fotos  (lee public/motos/)

/** Fotos de cada modelo, en orden. La primera es la que va en la tarjeta. */
export const FOTOS: Record<string, string[]> = {
${cuerpo}
};

/** Fotos de un modelo. Array vacío si todavía no tiene ninguna cargada. */
export function fotosDe(slug: string): string[] {
  return FOTOS[slug] ?? [];
}
`;

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, contenido);

const total = slugs.reduce((n, s) => n + fotos[s].length, 0);
console.log(`Manifiesto: ${total} fotos en ${slugs.length} modelos → data/fotos.ts`);
for (const s of slugs) console.log(`  ${s}: ${fotos[s].length}`);
