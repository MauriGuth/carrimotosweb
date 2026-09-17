/**
 * Deja las fotos listas para la web: las lleva a 1200x900 y las comprime.
 *
 *   1. Poné las fotos en fotos-crudas/. Sirve cualquiera de estas formas:
 *
 *        fotos-crudas/BAJAJ/BAJAJ - ROUSER NS 200/   ← tal cual vienen los zips
 *          ROUSER NS 200 01.jpg                         de cada marca: el
 *          ROUSER NS 200 02.jpg                         script entra en las
 *                                                       carpetas y empareja
 *                                                       por su nombre
 *
 *        fotos-crudas/gilera-sahel-150/              ← o una carpeta con el
 *          IMG_4471.jpg                                 slug del modelo
 *
 *        fotos-crudas/Honda CB 300 Twister.jpg       ← o sueltas, emparejadas
 *                                                       por nombre de archivo
 *   2. npm run fotos
 *
 * Salida:
 *   public/motos/<slug>/1.jpg, 2.jpg, …   si el modelo tiene varias
 *   public/motos/<slug>.jpg               si tiene una sola
 *
 * Distingue solo entre dos tipos de foto:
 *   · Recorte de estudio (fondo transparente o blanco) → recorta el aire y lo
 *     centra sobre blanco, para que todas queden del mismo tamaño relativo.
 *   · Foto de verdad (salón, calle, pista) → recorta al encuadre 4:3.
 *
 * El orden dentro de la galería sale del zip, salvo que el modelo tenga una
 * lista en data/orden-fotos.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MOTOS } from '../data/motos.ts';
import { ORDEN_FOTOS } from '../data/orden-fotos.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENTRADA = path.join(ROOT, 'fotos-crudas');
const SALIDA = path.join(ROOT, 'public', 'motos');

const ANCHO = 1200;
const ALTO = 900;
const CALIDAD = 82;

// Versión chica para las tarjetas del catálogo y la tira de miniaturas: sin
// esto el navegador se baja la foto de 1200x900 para mostrarla a 80 píxeles.
const ANCHO_MINI = 400;
const ALTO_MINI = 300;
const CALIDAD_MINI = 72;
const UMBRAL_MATCH = 0.55;
// Cuánto le tiene que sacar el mejor candidato al segundo para no considerarse
// dudoso.
const MARGEN = 0.12;

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

/**
 * Qué tan bien le va a un modelo contra el nombre que se está mirando, en dos
 * números:
 *
 *   cubre   — cuánto del modelo aparece en el nombre.
 *   explica — cuánto del nombre lo justifica el modelo.
 *
 * Los dos hacen falta. Con `cubre` sola, la carpeta "BENELLI - TRK 502 X"
 * empata entre TRK 502 y TRK 502 X, porque las tres palabras de la primera
 * están todas ahí. Lo que las separa es que la X queda sin explicar, y eso es
 * justo lo que mide el segundo número. Pasa con cualquier modelo que sea la
 * versión de otro, que en el catálogo hay de sobra.
 */
function puntaje(palabrasArchivo, moto) {
  const marca = palabras(moto.marca);
  if (!marca.every((p) => palabrasArchivo.includes(p))) return { cubre: 0, explica: 0 };

  const delModelo = palabras(`${moto.marca} ${moto.modelo}`);
  const comunes = delModelo.filter((p) => palabrasArchivo.includes(p)).length;
  return {
    cubre: comunes / delModelo.length,
    explica: comunes / palabrasArchivo.length,
  };
}

function emparejar(nombreArchivo) {
  const pa = palabras(nombreArchivo);
  if (!pa.length) return { estado: 'sin-match' };

  const candidatos = MOTOS.map((moto) => ({ moto, ...puntaje(pa, moto) }))
    .filter((c) => c.cubre >= UMBRAL_MATCH)
    .sort((a, b) => b.cubre - a.cubre || b.explica - a.explica);

  const [primero, segundo] = candidatos;
  if (!primero) return { estado: 'sin-match' };

  // Dudoso sólo si el segundo empata en las dos cosas: si cubre lo mismo pero
  // explica menos, el primero es mejor y no hay nada que dudar.
  if (segundo && primero.cubre - segundo.cubre < MARGEN && primero.explica - segundo.explica < MARGEN) {
    return { estado: 'ambiguo', moto: primero.moto };
  }
  return { estado: 'ok', moto: primero.moto };
}

/* ---------------------------------------------------------------- */
/* Procesar la imagen                                                */
/* ---------------------------------------------------------------- */

/** Debajo de esto la imagen tiene transparencia de verdad, no un borde suelto. */
const ALFA_DE_RECORTE = 250;

/**
 * ¿Es un recorte de estudio? Da por estudio dos casos:
 *
 *   · Fondo transparente. Los PNG que mandan los importadores vienen con la
 *     moto recortada sobre alfa. Si no se mira el canal alfa, el RGB de abajo
 *     es basura (casi siempre negro) y la foto termina sobre fondo NEGRO al
 *     pasarla a JPG, que es justo lo contrario de lo que se busca.
 *
 *     Se mide sobre la imagen entera y no sobre las esquinas: en una moto de
 *     frente los espejos llegan hasta arriba de todo, la esquina deja de estar
 *     vacía y el recorte pasaría por foto.
 *
 *   · Fondo blanco liso, el recorte ya aplanado sobre blanco. Ese sí se mira
 *     por las esquinas de arriba, que es donde una foto de verdad tendría
 *     pared, cielo o el resto del salón.
 *
 * Cualquier otra cosa es una foto de verdad (salón, calle, pista).
 */
async function esRecorteDeEstudio(origen) {
  try {
    const { width = 100, height = 100, hasAlpha } = await sharp(origen).metadata();

    if (hasAlpha) {
      const alfa = (await sharp(origen).stats()).channels[3];
      if (alfa && alfa.mean < ALFA_DE_RECORTE) return true;
    }

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

      const alfa = channels[3];
      const transparente = alfa ? alfa.max < 16 : false;
      const blanco = channels.slice(0, 3).every((c) => c.mean > 240 && c.stdev < 12);
      if (!transparente && !blanco) return false;

    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Deja una foto lista. Devuelve el tipo y, si la original era más chica que
 * el encuadre, cuánto hubo que estirarla.
 *
 * Todas salen del mismo tamaño aunque la original venga en baja: una moto
 * chiquita flotando en un marco blanco se ve rota al lado de las demás, y es
 * peor que una foto un poco blanda. Las que hubo que estirar se avisan al
 * final para poder pedirle el archivo bueno al importador.
 */
async function procesar(origen, destino, destinoMini) {
  const estudio = await esRecorteDeEstudio(origen);

  if (estudio) {
    // Recorta el blanco sobrante y rearma el margen parejo, para que todas
    // las motos queden del mismo tamaño relativo.
    const base = sharp(origen).flatten({ background: '#ffffff' });
    const recortada = await base
      .trim({ threshold: 12 })
      .toBuffer()
      .catch(() => base.toBuffer());

    const caja = { ancho: Math.round(ANCHO * 0.88), alto: Math.round(ALTO * 0.88) };
    const { width = caja.ancho, height = caja.alto } = await sharp(recortada).metadata();

    await sharp(recortada)
      .resize(caja.ancho, caja.alto, { fit: 'inside' })
      .resize(ANCHO, ALTO, { fit: 'contain', background: '#ffffff' })
      .jpeg({ quality: CALIDAD, mozjpeg: true })
      .toFile(destino);
    await hacerMini(destino, destinoMini);

    // Encaje 'inside': entra entera, manda el lado que primero toca el borde.
    return { tipo: 'estudio', estirada: estiron(Math.min(caja.ancho / width, caja.alto / height), width, height) };
  }

  // Foto del salón: recorta al encuadre, sin barras blancas. Salvo que
  // recortar se lleve puesta media imagen —los importadores meten tiras
  // panorámicas con cuatro detalles al hilo, y el encuadre 4:3 agarra dos y
  // parece un error—: ahí entra entera sobre blanco.
  const { width = ANCHO, height = ALTO } = await sharp(origen).metadata();
  const queda = Math.min(width / height, ANCHO / ALTO) / Math.max(width / height, ANCHO / ALTO);
  const entera = queda < SE_PIERDE_DEMASIADO;

  await sharp(origen)
    .rotate() // respeta la orientación EXIF del celular
    .resize(ANCHO, ALTO, entera ? { fit: 'contain', background: '#ffffff' } : { fit: 'cover', position: 'center' })
    .jpeg({ quality: CALIDAD, mozjpeg: true })
    .toFile(destino);
  await hacerMini(destino, destinoMini);

  const factor = entera
    ? Math.min(ANCHO / width, ALTO / height) // 'contain': entra entera
    : Math.max(ANCHO / width, ALTO / height); // 'cover': llena el marco
  return { tipo: 'foto', estirada: estiron(factor, width, height) };
}

/** Si al recortar al encuadre queda menos que esto, se muestra entera. */
const SE_PIERDE_DEMASIADO = 0.6;

/** Se avisa a partir de acá: por debajo el estirón no se nota. */
const ESTIRON_QUE_SE_NOTA = 1.15;

/** Describe el estirón si la original no daba el tamaño. null si daba. */
function estiron(factor, ancho, alto) {
  return factor > ESTIRON_QUE_SE_NOTA ? { factor, ancho, alto } : null;
}

async function hacerMini(origen, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  await sharp(origen)
    .resize(ANCHO_MINI, ALTO_MINI, { fit: 'cover' })
    .jpeg({ quality: CALIDAD_MINI, mozjpeg: true })
    .toFile(destino);
}

/* ---------------------------------------------------------------- */
/* Juntar el trabajo                                                 */
/* ---------------------------------------------------------------- */

function porNumero(a, b) {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

/**
 * Aplica el orden de galería de data/orden-fotos.ts. Si la lista no es una
 * permutación exacta de las fotos que llegaron —porque el zip cambió— avisa y
 * deja el orden original, en vez de recortar o repetir fotos en silencio.
 */
function reordenar(grupos) {
  const avisos = [];

  for (const [slug, rutas] of grupos) {
    const orden = ORDEN_FOTOS[slug];
    if (!orden) continue;

    const completo =
      orden.length === rutas.length &&
      new Set(orden).size === orden.length &&
      orden.every((n) => Number.isInteger(n) && n >= 1 && n <= rutas.length);

    if (!completo) {
      avisos.push(
        `${slug}: el orden de data/orden-fotos.ts no coincide con las ${rutas.length} fotos que llegaron; queda el orden del zip`,
      );
      continue;
    }

    grupos.set(
      slug,
      orden.map((n) => rutas[n - 1]),
    );
  }

  return avisos;
}

/**
 * Recorre fotos-crudas/ entera y arma { slug: [rutas de origen] }.
 *
 * Una carpeta que contiene imágenes se resuelve por su nombre: primero se
 * prueba como slug exacto y si no, se empareja por palabras, de modo que
 * "BAJAJ - ROUSER NS 200" cae en bajaj-rouser-ns-200 sin tocar nada. Las
 * carpetas que sólo contienen otras carpetas (como "BAJAJ/") se atraviesan.
 */
function planificar() {
  const grupos = new Map();
  const revisar = [];

  const sumar = (slug, rutas) => grupos.set(slug, [...(grupos.get(slug) ?? []), ...rutas]);

  const recorrer = (dir, etiqueta) => {
    const entradas = fs.readdirSync(dir, { withFileTypes: true });
    const imagenes = entradas
      .filter((e) => e.isFile() && ES_IMAGEN.test(e.name))
      .map((e) => e.name)
      .sort(porNumero);
    const subcarpetas = entradas.filter((e) => e.isDirectory());

    if (imagenes.length) {
      const rutas = imagenes.map((f) => path.join(dir, f));

      if (etiqueta === null) {
        // Sueltas en la raíz: se emparejan una por una por nombre de archivo.
        for (const ruta of rutas) {
          const r = emparejar(path.basename(ruta));
          if (r.estado === 'ok') sumar(r.moto.slug, [ruta]);
          else
            revisar.push({
              archivo: path.relative(ENTRADA, ruta),
              motivo:
                r.estado === 'sin-match'
                  ? 'no coincide con ningún modelo'
                  : `podría ser ${r.moto.nombre}, pero hay otro parecido`,
            });
        }
      } else if (SLUGS.has(etiqueta)) {
        sumar(etiqueta, rutas);
      } else {
        const r = emparejar(etiqueta);
        if (r.estado === 'ok') sumar(r.moto.slug, rutas);
        else
          revisar.push({
            archivo: `${path.relative(ENTRADA, dir)}/ (${rutas.length} fotos)`,
            motivo:
              r.estado === 'sin-match'
                ? 'el nombre de la carpeta no coincide con ningún modelo'
                : `podría ser ${r.moto.nombre}, pero hay otro parecido`,
          });
      }
    }

    for (const sub of subcarpetas) recorrer(path.join(dir, sub.name), sub.name);
  };

  recorrer(ENTRADA, null);
  return { grupos, revisar };
}

async function main() {
  if (!fs.existsSync(ENTRADA)) {
    fs.mkdirSync(ENTRADA, { recursive: true });
    console.log(`Creé la carpeta fotos-crudas/. Poné ahí las fotos y volvé a correr: npm run fotos`);
    return;
  }

  const { grupos, revisar } = planificar();
  const estiradas = [];
  for (const aviso of reordenar(grupos)) console.warn(`  ! ${aviso}`);

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
      fs.rmSync(path.join(dirDestino, 'mini'), { recursive: true, force: true });
      const suelta = path.join(SALIDA, `${slug}.jpg`);
      if (fs.existsSync(suelta)) fs.unlinkSync(suelta);
      fs.rmSync(path.join(SALIDA, 'mini', `${slug}.jpg`), { force: true });
    } else if (fs.existsSync(path.join(SALIDA, slug))) {
      fs.rmSync(path.join(SALIDA, slug), { recursive: true, force: true });
    }

    const tipos = [];
    for (const [i, origen] of origenes.entries()) {
      const destino = galeria ? path.join(dirDestino, `${i + 1}.jpg`) : path.join(SALIDA, `${slug}.jpg`);
      const destinoMini = galeria
        ? path.join(dirDestino, 'mini', `${i + 1}.jpg`)
        : path.join(SALIDA, 'mini', `${slug}.jpg`);
      try {
        const r = await procesar(origen, destino, destinoMini);
        tipos.push(r.tipo);
        if (r.estirada) {
          estiradas.push({
            foto: galeria ? `${slug}/${i + 1}.jpg` : `${slug}.jpg`,
            origen: path.basename(origen),
            ...r.estirada,
          });
        }
      } catch (e) {
        revisar.push({ archivo: path.basename(origen), motivo: e.message });
      }
    }

    const kb = Math.round(
      (galeria
        ? fs
            .readdirSync(dirDestino)
            .filter((f) => ES_IMAGEN.test(f))
            .reduce((n, f) => n + fs.statSync(path.join(dirDestino, f)).size, 0)
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

  if (estiradas.length) {
    console.log(`\nVienen en baja y hubo que estirarlas: ${estiradas.length}`);
    for (const e of estiradas) {
      console.log(`  ${e.foto}  (${e.origen}: ${e.ancho}x${e.alto}, x${e.factor.toFixed(1)})`);
    }
    console.log(`\n  Se publican igual, pero conviene pedirle el archivo grande al importador.`);
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

/**
 * Chequeo del emparejador. Para cada modelo del catálogo simula la carpeta
 * "MARCA - MODELO" —que es como vienen los zips de los importadores— y
 * verifica que caiga en ese modelo y no en otro.
 *
 * Los que se rompen fácil son los modelos que son la versión de otro: TRK 502
 * y TRK 502 X, SKUA 250 y SKUA 250 ADVENTURE, y así. Conviene correrlo cuando
 * se toca el emparejador o cuando entran modelos nuevos al catálogo:
 *
 *   npm run fotos:probar
 */
function probar() {
  const fallan = [];

  for (const moto of MOTOS) {
    const carpeta = `${moto.marca} - ${moto.modelo}`;
    const r = emparejar(carpeta);
    if (r.estado === 'ok' && r.moto.slug === moto.slug) continue;

    const cayo =
      r.estado === 'sin-match' ? 'no coincide con ninguno' : `${r.moto.nombre}${r.estado === 'ambiguo' ? ' (dudoso)' : ''}`;
    fallan.push(`${carpeta}  →  ${cayo}`);
  }

  if (fallan.length) {
    console.log(`Emparejador: ${fallan.length} de ${MOTOS.length} modelos no caen donde deberían\n`);
    for (const f of fallan) console.log(`  ${f}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Emparejador: los ${MOTOS.length} modelos caen en su propia carpeta "MARCA - MODELO".`);
}

if (process.argv.includes('--probar')) probar();
else main();
