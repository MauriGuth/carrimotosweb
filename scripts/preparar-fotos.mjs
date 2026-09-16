/**
 * Toma las fotos crudas que mandan los importadores y las deja listas para la
 * web: recorta el aire sobrante, las centra sobre fondo blanco en 4:3, las
 * lleva a 1200x900 y las comprime.
 *
 *   1. Poné los archivos como vengan en  fotos-crudas/
 *   2. npm run fotos
 *   3. Salen en  public/motos/<slug>.jpg
 *
 * No hace falta renombrar nada: el script empareja cada archivo con su modelo
 * comparando palabras. "Honda CB 300 Twister (1).png" → honda-cb-300-twister.
 * Lo que no puede emparejar con confianza lo deja sin tocar y lo informa, para
 * que no se cargue una foto en el modelo equivocado.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MOTOS } from '../data/motos.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENTRADA = path.join(ROOT, 'fotos-crudas');
const SALIDA = path.join(ROOT, 'public', 'motos');

const ANCHO = 1200;
const ALTO = 900;
const CALIDAD = 82;
/** Debajo de este puntaje no se arriesga a emparejar. */
const UMBRAL = 0.55;

const soloListar = process.argv.includes('--listar');

/* ---------------------------------------------------------------- */
/* Emparejar archivo con modelo                                      */
/* ---------------------------------------------------------------- */

function palabras(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

/**
 * Puntaje de 0 a 1: cuántas palabras del modelo aparecen en el nombre del
 * archivo. Se exige además que la marca coincida, para no confundir una
 * "150" de una marca con la de otra.
 */
function puntaje(palabrasArchivo, moto) {
  const delModelo = palabras(`${moto.marca} ${moto.modelo}`);
  const marca = palabras(moto.marca);

  const tieneMarca = marca.every((p) => palabrasArchivo.includes(p));
  if (!tieneMarca) return 0;

  const encontradas = delModelo.filter((p) => palabrasArchivo.includes(p)).length;
  return encontradas / delModelo.length;
}

function emparejar(nombreArchivo) {
  const pa = palabras(nombreArchivo);
  let mejor = null;
  let mejorPuntaje = 0;
  let segundoPuntaje = 0;

  for (const moto of MOTOS) {
    const p = puntaje(pa, moto);
    if (p > mejorPuntaje) {
      segundoPuntaje = mejorPuntaje;
      mejorPuntaje = p;
      mejor = moto;
    } else if (p > segundoPuntaje) {
      segundoPuntaje = p;
    }
  }

  if (!mejor || mejorPuntaje < UMBRAL) return { estado: 'sin-match', puntaje: mejorPuntaje };
  // Si hay dos modelos casi igual de buenos, mejor no adivinar.
  if (mejorPuntaje - segundoPuntaje < 0.12) return { estado: 'ambiguo', moto: mejor, puntaje: mejorPuntaje };
  return { estado: 'ok', moto: mejor, puntaje: mejorPuntaje };
}

/* ---------------------------------------------------------------- */
/* Procesar la imagen                                                */
/* ---------------------------------------------------------------- */

async function procesar(origen, destino) {
  const base = sharp(origen).flatten({ background: '#ffffff' });

  // Recorta el borde blanco sobrante para que todas las motos queden del
  // mismo tamaño relativo, y después reconstruye el margen parejo.
  const recortada = await base.trim({ threshold: 12 }).toBuffer().catch(() => base.toBuffer());

  await sharp(recortada)
    .resize(Math.round(ANCHO * 0.88), Math.round(ALTO * 0.88), {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
    })
    .resize(ANCHO, ALTO, { fit: 'contain', background: '#ffffff' })
    .jpeg({ quality: CALIDAD, mozjpeg: true })
    .toFile(destino);
}

/* ---------------------------------------------------------------- */

async function main() {
  if (!fs.existsSync(ENTRADA)) {
    fs.mkdirSync(ENTRADA, { recursive: true });
    console.log(`Creé la carpeta ${path.relative(ROOT, ENTRADA)}/`);
    console.log('Poné ahí las fotos como vengan y volvé a correr: npm run fotos');
    return;
  }

  const archivos = fs.readdirSync(ENTRADA).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
  if (!archivos.length) {
    console.log(`No hay imágenes en ${path.relative(ROOT, ENTRADA)}/`);
    return;
  }

  fs.mkdirSync(SALIDA, { recursive: true });

  const ok = [];
  const revisar = [];

  for (const archivo of archivos) {
    const r = emparejar(archivo);

    if (r.estado !== 'ok') {
      revisar.push({ archivo, ...r });
      continue;
    }

    const destino = path.join(SALIDA, `${r.moto.slug}.jpg`);
    if (soloListar) {
      ok.push({ archivo, moto: r.moto, puntaje: r.puntaje, kb: null });
      continue;
    }

    try {
      await procesar(path.join(ENTRADA, archivo), destino);
      const kb = Math.round(fs.statSync(destino).size / 1024);
      ok.push({ archivo, moto: r.moto, puntaje: r.puntaje, kb });
    } catch (e) {
      revisar.push({ archivo, estado: 'error', detalle: e.message });
    }
  }

  console.log(`\n${soloListar ? 'Se emparejarían' : 'Procesadas'}: ${ok.length}`);
  for (const r of ok) {
    console.log(`  ${r.archivo}  →  ${r.moto.slug}.jpg${r.kb ? `  (${r.kb} KB)` : ''}`);
  }

  if (revisar.length) {
    console.log(`\nPara revisar a mano: ${revisar.length}`);
    for (const r of revisar) {
      const motivo =
        r.estado === 'sin-match'
          ? 'no coincide con ningún modelo'
          : r.estado === 'ambiguo'
            ? `podría ser ${r.moto.nombre}, pero hay otro parecido`
            : r.detalle;
      console.log(`  ${r.archivo}  →  ${motivo}`);
    }
    console.log(`\n  Renombralos con el modelo completo (marca incluida) y volvé a correr.`);
  }

  const total = MOTOS.length;
  const cargadas = fs.existsSync(SALIDA)
    ? fs.readdirSync(SALIDA).filter((f) => /\.jpe?g$/i.test(f)).length
    : 0;
  console.log(`\nCobertura del catálogo: ${cargadas} de ${total} modelos con foto.`);
}

main();
