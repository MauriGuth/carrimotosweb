/**
 * Genera plantilla-ficha-tecnica.xlsx: una fila por modelo, con MARCA y MODELO
 * ya cargados y una columna vacía por campo de la ficha.
 *
 *   npm run ficha:plantilla
 *
 * Se completa con los datos de las fichas oficiales de cada terminal, se pega
 * como hoja FICHA en scripts/catalogo.xlsx y se corre npm run import:catalogo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import { MOTOS } from '../data/motos.ts';
import { FICHAS } from '../data/fichas.ts';
import { CAMPOS_FICHA } from '../data/campos-ficha.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.join(__dirname, '..', 'plantilla-ficha-tecnica.xlsx');

const filas = MOTOS.map((m) => {
  const ficha = FICHAS[m.slug] ?? {};
  const fila = { MARCA: m.marca, MODELO: m.modelo };
  for (const campo of CAMPOS_FICHA) fila[campo.columna] = ficha[campo.clave] ?? '';
  return fila;
});

const hoja = XLSX.utils.json_to_sheet(filas, {
  header: ['MARCA', 'MODELO', ...CAMPOS_FICHA.map((c) => c.columna)],
});
hoja['!cols'] = [{ wch: 16 }, { wch: 30 }, ...CAMPOS_FICHA.map(() => ({ wch: 20 }))];

const libro = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(libro, hoja, 'FICHA');
XLSX.writeFile(libro, SALIDA);

const cargadas = MOTOS.filter((m) => FICHAS[m.slug]).length;
console.log(`plantilla-ficha-tecnica.xlsx: ${filas.length} modelos, ${CAMPOS_FICHA.length} campos.`);
console.log(`Ya cargadas: ${cargadas}. Faltan: ${filas.length - cargadas}.`);
console.log(`\nCompletala, pegala como hoja FICHA en scripts/catalogo.xlsx y corré: npm run import:catalogo`);
