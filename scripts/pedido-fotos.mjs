/**
 * Genera el listado de modelos agrupado por marca, listo para pedirle el
 * material de prensa a cada importador.
 *
 *   node scripts/pedido-fotos.mjs            → resumen + estado de cobertura
 *   node scripts/pedido-fotos.mjs --texto    → un bloque de texto por marca
 *   node scripts/pedido-fotos.mjs --csv      → planilla marca,modelo,archivo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOTOS } from '../data/motos.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIR_FOTOS = path.join(ROOT, 'public', 'motos');

const modo = process.argv.includes('--texto') ? 'texto' : process.argv.includes('--csv') ? 'csv' : 'resumen';

/** Slugs que ya tienen foto cargada. */
function fotosPresentes() {
  if (!fs.existsSync(DIR_FOTOS)) return new Set();
  return new Set(
    fs
      .readdirSync(DIR_FOTOS)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .map((f) => f.replace(/\.[^.]+$/, '')),
  );
}

const presentes = fotosPresentes();
const faltan = MOTOS.filter((m) => !presentes.has(m.slug));

const porMarca = new Map();
for (const m of faltan) {
  if (!porMarca.has(m.marca)) porMarca.set(m.marca, []);
  porMarca.get(m.marca).push(m);
}
const marcas = [...porMarca.entries()].sort((a, b) => b[1].length - a[1].length);

if (modo === 'csv') {
  console.log('marca,modelo,archivo_que_espera_la_web');
  for (const [marca, motos] of marcas) {
    for (const m of motos) console.log(`"${marca}","${m.modelo}","${m.slug}.jpg"`);
  }
} else if (modo === 'texto') {
  for (const [marca, motos] of marcas) {
    console.log(`\n${'='.repeat(64)}\n${marca} — ${motos.length} modelos\n${'='.repeat(64)}`);
    console.log(
      `Hola, somos CARRI Motos. Estamos armando nuestro catálogo web y necesitamos\n` +
        `las fotos oficiales de producto (fondo blanco, alta resolución) de estos\n` +
        `modelos que comercializamos:\n`,
    );
    for (const m of motos) console.log(`  · ${m.modelo}`);
    console.log(`\n¿Nos pueden pasar el material de prensa o el acceso al portal de imágenes?\nGracias.`);
  }
} else {
  const total = MOTOS.length;
  console.log(`Fotos cargadas: ${presentes.size} de ${total}`);
  console.log(`Faltan:         ${faltan.length}\n`);
  console.log('Por marca (de mayor a menor):');
  for (const [marca, motos] of marcas) {
    console.log(`  ${marca.padEnd(16)} ${String(motos.length).padStart(3)} modelos`);
  }
  console.log(`\nPara el texto a mandar a cada importador: node scripts/pedido-fotos.mjs --texto`);
  console.log(`Para una planilla:                       node scripts/pedido-fotos.mjs --csv`);
}
