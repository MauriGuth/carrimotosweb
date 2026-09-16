/**
 * Deja las fotos listas para la web: las lleva a 1200x900 y las comprime.
 *
 *   1. Poné las fotos en fotos-crudas/, de una de estas dos formas:
 *
 *        fotos-crudas/gilera-sahel-150/       ← una carpeta por modelo
 *          IMG_4471.jpg                          (todas van a ese modelo,
 *          IMG_4472.jpg                           en orden por nombre)
 *
 *        fotos-crudas/Honda CB 300 Twister.jpg ← o sueltas, y el script
 *                                                 adivina el modelo por el
 *                                                 nombre del archivo
 *   2. npm run fotos
 *
 * Salida:
 *   public/motos/<slug>/1.jpg, 2.jpg, …   si el modelo tiene varias
 *   public/motos/<slug>.jpg               si tiene una sola
 *
 * Distingue solo entre dos tipos de foto:
 *   · Foto de estudio (fondo blanco)  → recorta el aire y centra sobre blanco.
 *   · Foto del salón                  → recorta al encuadre 4:3 sin bordes.
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
const UMBRAL_MATCH = 0.55;

const ES_IMAGEN = /\.(jpe?g|png|webp|avif|tiff?|heic)$/i;
const SLUGS = new Set(MOTOS.map((m) => m.slug));

/* ---------------------------------------------------------------- */
/* Emparejar nombre de archivo con modelo                            */
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

function puntaje(palabrasArchivo, moto) {
  const delModelo = palabras(`${moto.marca} ${moto.modelo}`);
  const marca = palabras(moto.marca);
  if (!marca.every((p) => palabrasArchivo.includes(p))) return 0;
  return delModelo.filter((p) => palabrasArchivo.includes(p)).length / delModelo.length;
}

function emparejar(nombreArchivo) {
  const pa = palabras(nombreArchivo);
  let mejor = null;
  let primero = 0;
  let segundo = 0;

  for (const moto of MOTOS) {
    const p = puntaje(pa, moto);
    if (p > primero) {
      segundo = primero;
      primero = p;
      mejor = moto;
    } else if (p > segundo) {
      segundo = p;
    }
  }

  if (!mejor || primero < UMBRAL_MATCH) return { estado: 'sin-match' };
  if (primero - segundo < 0.12) return { estado: 'ambiguo', moto: mejor };
  return { estado: 'ok', moto: mejor };
}

/* ---------------------------------------------------------------- */
/* Procesar la imagen                                                */
/* ---------------------------------------------------------------- */

/**
 * ¿Tiene fondo blanco de estudio? Mira el promedio del borde superior: si es
 * casi blanco, se trata como recorte sobre blanco; si no, como foto.
 */
async function tieneFondoBlanco(origen) {
  try {
    const { width = 100, height = 100 } = await sharp(origen).metadata();
    const ancho = Math.max(1, Math.floor(width * 0.15));
    const alto = Math.max(1, Math.floor(height * 0.1));

    // Mira las dos esquinas de arriba. Se recorta a un buffer aparte porque
    // sharp calcula stats() sobre la imagen de entrada, no sobre el extract
    // encadenado: midiendo así se estaría promediando la foto entera.
    const esquinas = [
      { left: 0, top: 0, width: ancho, height: alto },
      { left: width - ancho, top: 0, width: ancho, height: alto },
    ];

    for (const region of esquinas) {
      const recorte = await sharp(origen).extract(region).toBuffer();
      const { channels } = await sharp(recorte).stats();
      const claro = channels.slice(0, 3).every((c) => c.mean > 240 && c.stdev < 12);
      if (!claro) return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function procesar(origen, destino) {
  const estudio = await tieneFondoBlanco(origen);

  if (estudio) {
    // Recorta el blanco sobrante y rearma el margen parejo, para que todas
    // las motos queden del mismo tamaño relativo.
    const base = sharp(origen).flatten({ background: '#ffffff' });
    const recortada = await base
      .trim({ threshold: 12 })
      .toBuffer()
      .catch(() => base.toBuffer());

    await sharp(recortada)
      .resize(Math.round(ANCHO * 0.88), Math.round(ALTO * 0.88), { fit: 'inside', withoutEnlargement: true })
      .resize(ANCHO, ALTO, { fit: 'contain', background: '#ffffff' })
      .jpeg({ quality: CALIDAD, mozjpeg: true })
      .toFile(destino);
    return 'estudio';
  }

  // Foto del salón: recorta al encuadre, sin barras blancas.
  await sharp(origen)
    .rotate() // respeta la orientación EXIF del celular
    .resize(ANCHO, ALTO, { fit: 'cover', position: 'center' })
    .jpeg({ quality: CALIDAD, mozjpeg: true })
    .toFile(destino);
  return 'foto';
}

/* ---------------------------------------------------------------- */
/* Juntar el trabajo                                                 */
/* ---------------------------------------------------------------- */

function porNumero(a, b) {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

/** Devuelve { slug: [rutas de origen] } y la lista de lo que no pudo ubicar. */
function planificar() {
  const grupos = new Map();
  const revisar = [];

  for (const entrada of fs.readdirSync(ENTRADA, { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      const slug = entrada.name;
      if (!SLUGS.has(slug)) {
        revisar.push({ archivo: `${slug}/`, motivo: 'la carpeta no coincide con ningún slug de data/motos.ts' });
        continue;
      }
      const dentro = fs
        .readdirSync(path.join(ENTRADA, slug))
        .filter((f) => ES_IMAGEN.test(f))
        .sort(porNumero)
        .map((f) => path.join(ENTRADA, slug, f));
      if (dentro.length) grupos.set(slug, [...(grupos.get(slug) ?? []), ...dentro]);
      continue;
    }

    if (!ES_IMAGEN.test(entrada.name)) continue;

    const r = emparejar(entrada.name);
    if (r.estado !== 'ok') {
      revisar.push({
        archivo: entrada.name,
        motivo:
          r.estado === 'sin-match'
            ? 'no coincide con ningún modelo'
            : `podría ser ${r.moto.nombre}, pero hay otro parecido`,
      });
      continue;
    }
    grupos.set(r.moto.slug, [...(grupos.get(r.moto.slug) ?? []), path.join(ENTRADA, entrada.name)]);
  }

  return { grupos, revisar };
}

async function main() {
  if (!fs.existsSync(ENTRADA)) {
    fs.mkdirSync(ENTRADA, { recursive: true });
    console.log(`Creé la carpeta fotos-crudas/. Poné ahí las fotos y volvé a correr: npm run fotos`);
    return;
  }

  const { grupos, revisar } = planificar();

  if (!grupos.size && !revisar.length) {
    console.log('No hay imágenes en fotos-crudas/');
    return;
  }

  for (const [slug, origenes] of grupos) {
    // Si el modelo tiene varias fotos va a carpeta propia; si es una sola,
    // queda como archivo suelto.
    const galeria = origenes.length > 1;
    const dirDestino = galeria ? path.join(SALIDA, slug) : SALIDA;
    fs.mkdirSync(dirDestino, { recursive: true });

    // Se limpia lo anterior de ese modelo para que no queden fotos viejas
    // mezcladas con las nuevas.
    if (galeria) {
      for (const f of fs.readdirSync(dirDestino)) {
        if (ES_IMAGEN.test(f)) fs.unlinkSync(path.join(dirDestino, f));
      }
      const suelta = path.join(SALIDA, `${slug}.jpg`);
      if (fs.existsSync(suelta)) fs.unlinkSync(suelta);
    } else if (fs.existsSync(path.join(SALIDA, slug))) {
      fs.rmSync(path.join(SALIDA, slug), { recursive: true, force: true });
    }

    const tipos = [];
    for (const [i, origen] of origenes.entries()) {
      const destino = galeria ? path.join(dirDestino, `${i + 1}.jpg`) : path.join(SALIDA, `${slug}.jpg`);
      try {
        tipos.push(await procesar(origen, destino));
      } catch (e) {
        revisar.push({ archivo: path.basename(origen), motivo: e.message });
      }
    }

    const kb = Math.round(
      (galeria
        ? fs.readdirSync(dirDestino).reduce((n, f) => n + fs.statSync(path.join(dirDestino, f)).size, 0)
        : fs.statSync(path.join(SALIDA, `${slug}.jpg`)).size) / 1024,
    );
    const deEstudio = tipos.filter((t) => t === 'estudio').length;
    const detalle = deEstudio ? ` (${deEstudio} de estudio, ${tipos.length - deEstudio} de salón)` : '';
    console.log(`  ${slug}: ${tipos.length} ${tipos.length === 1 ? 'foto' : 'fotos'}${detalle}, ${kb} KB`);
  }

  if (revisar.length) {
    console.log(`\nPara revisar a mano: ${revisar.length}`);
    for (const r of revisar) console.log(`  ${r.archivo}  →  ${r.motivo}`);
    console.log(`\n  Renombralos con marca y modelo, o ponelos en una carpeta con el slug del modelo.`);
  }

  const total = MOTOS.length;
  const conFoto = new Set();
  if (fs.existsSync(SALIDA)) {
    for (const e of fs.readdirSync(SALIDA, { withFileTypes: true })) {
      if (e.isDirectory()) conFoto.add(e.name);
      else if (ES_IMAGEN.test(e.name)) conFoto.add(e.name.replace(/\.[^.]+$/, ''));
    }
  }
  console.log(`\nCobertura: ${conFoto.size} de ${total} modelos con foto.`);
}

main();
