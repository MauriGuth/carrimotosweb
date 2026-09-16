/**
 * Recorre public/motos y genera data/fotos.ts: qué fotos tiene cada modelo y
 * dónde está la versión chica de cada una. El navegador no puede leer el
 * contenido de una carpeta, así que la web necesita este índice.
 *
 * Lo corre solo `npm run fotos`.
 *
 * Estructura que reconoce:
 *   public/motos/<slug>.jpg           +  public/motos/mini/<slug>.jpg
 *   public/motos/<slug>/1.jpg, 2.jpg  +  public/motos/<slug>/mini/1.jpg, …
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

/** Si no existe la versión chica, se usa la grande: nunca queda una rota. */
function conMini(grande, mini) {
  return { grande, mini: fs.existsSync(path.join(ROOT, 'public', mini.slice(1))) ? mini : grande };
}

function recolectar() {
  if (!fs.existsSync(DIR)) return {};
  const fotos = {};

  for (const entrada of fs.readdirSync(DIR, { withFileTypes: true })) {
    if (entrada.name === 'mini') continue;

    if (entrada.isDirectory()) {
      const archivos = fs
        .readdirSync(path.join(DIR, entrada.name))
        .filter((f) => ES_IMAGEN.test(f))
        .sort(porNumero);
      if (archivos.length) {
        fotos[entrada.name] = archivos.map((f) =>
          conMini(`/motos/${entrada.name}/${f}`, `/motos/${entrada.name}/mini/${f}`),
        );
      }
    } else if (ES_IMAGEN.test(entrada.name)) {
      const slug = entrada.name.replace(/\.[^.]+$/, '');
      fotos[slug] = [...(fotos[slug] ?? []), conMini(`/motos/${entrada.name}`, `/motos/mini/${entrada.name}`)];
    }
  }

  return fotos;
}

const fotos = recolectar();
const slugs = Object.keys(fotos).sort();

const cuerpo = slugs
  .map(
    (s) =>
      `  ${JSON.stringify(s)}: [\n${fotos[s]
        .map((f) => `    { grande: ${JSON.stringify(f.grande)}, mini: ${JSON.stringify(f.mini)} },`)
        .join('\n')}\n  ],`,
  )
  .join('\n');

const contenido = `// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run fotos  (lee public/motos/)

/**
 * Una foto del catálogo. \`grande\` es la de 1200x900 para la ficha;
 * \`mini\` es la de 400x300 para las tarjetas y las miniaturas.
 */
export type Foto = { grande: string; mini: string };

/** Fotos de cada modelo, en orden. La primera es la que va en la tarjeta. */
export const FOTOS: Record<string, Foto[]> = {
${cuerpo}
};

/** Fotos de un modelo. Array vacío si todavía no tiene ninguna cargada. */
export function fotosDe(slug: string): Foto[] {
  return FOTOS[slug] ?? [];
}
`;

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, contenido);

const total = slugs.reduce((n, s) => n + fotos[s].length, 0);
console.log(`Manifiesto: ${total} fotos en ${slugs.length} modelos → data/fotos.ts`);
