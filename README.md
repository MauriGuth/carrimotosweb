# CARRI Motos — sitio web

Catálogo online de CARRI Motos: los clientes ven los modelos, entran a la ficha
de cada uno y piden más información por WhatsApp al vendedor de la sucursal que
les quede más cómoda.

Hecho con **Next.js 15 + TypeScript + Tailwind CSS 4**, pensado para publicarse
en **Vercel**.

---

## Lo que hay que completar antes de publicar

### 1. Los tres WhatsApp — `data/sucursales.ts`

Es el archivo más importante. Ahí están los tres contactos con el nombre del
vendedor, el nombre de la sucursal, el teléfono, la dirección y los horarios.
**Los datos que están cargados hoy son de ejemplo.**

El teléfono va en formato internacional, sin `+`, ni espacios, ni guiones:

```
+54 9 280 412-3456   →   "5492804123456"
```

Con eso ya funcionan todos los links del sitio: los del pie, los de la ficha de
cada moto, los de la página de sucursales y el botón flotante de WhatsApp. El
mensaje sale escrito solo, con el nombre del vendedor y el modelo que el cliente
estaba mirando.

### 2. El logo — `components/Logo.tsx`

El logo está redibujado en SVG para que se vea bien sobre fondo oscuro y en
cualquier tamaño. Si preferís usar el archivo original, poné la imagen en
`public/logo.png` y reemplazá el contenido de `components/Logo.tsx` por:

```tsx
import Image from 'next/image';

export default function Logo({ className = 'h-10 w-auto' }: { className?: string }) {
  return <Image src="/logo.png" alt="CARRI Motos" width={300} height={118} className={className} priority />;
}
```

### 3. Las fotos de las motos — `public/motos/`

Cada modelo busca su foto en `public/motos/<slug>.jpg`. Mientras no exista, se
muestra un placeholder con la marca, así el catálogo se ve completo igual.

El *slug* es el nombre del modelo en minúsculas y con guiones. Los tenés todos
en `data/motos.ts`. Por ejemplo:

| Modelo | Archivo |
| --- | --- |
| HONDA CB 300 TWISTER | `public/motos/honda-cb-300-twister.jpg` |
| GILERA SMASH 125 CBS | `public/motos/gilera-smash-125-cbs.jpg` |
| MOTOMEL SKUA 250 BASE | `public/motos/motomel-skua-250-base.jpg` |

Recomendado: JPG de ~1200×900 px, fondo claro o transparente, menos de 300 KB.

---

## Actualizar el catálogo

El catálogo sale de la planilla del local (la misma "PARA CARGAR SISTEMA").
Para actualizarlo:

1. Copiá la planilla a `scripts/catalogo.xlsx`.
2. Corré `npm run import:catalogo`.
3. Revisá el cambio en `data/motos.ts` y `data/accesorios.ts`, y commiteá.

El script regenera esos dos archivos, así que **no hay que editarlos a mano**.

> **La planilla no se sube al repo.** Está en el `.gitignore` porque tiene los
> números de motor y de chasis de las unidades del local, y este repositorio es
> público. Guardala aparte y copiala a `scripts/catalogo.xlsx` cada vez que
> necesites correr el import. Los archivos que sí se commitean (`data/motos.ts`
> y `data/accesorios.ts`) no contienen ningún número de serie.

### Qué toma de la planilla

De la hoja `MOTOS` usa **MARCA**, **MODELO** y **COLOR**. De la hoja
`ACCESORIOS`, el artículo y el precio.

Las columnas **MOTOR** y **CUADRO** son números de motor y de chasis de unidades
físicas: son datos internos del local y **no se publican**. Sólo se usan para
marcar qué modelos tienen una unidad cargada y mostrarles el cartel de
"Entrega inmediata".

### De dónde salen la cilindrada y la categoría

La planilla no trae ficha técnica ni precios de las motos, así que:

- **La cilindrada** se saca de los números del nombre del modelo (`SMASH 125 CBS`
  → 125cc). Si el nombre no la dice, queda vacía y la web no la muestra: no se
  inventa ningún dato.
- **La categoría** la asigna una lista de reglas en `scripts/import-catalogo.mjs`
  (`REGLAS_CATEGORIA`). Si algún modelo quedó en la categoría equivocada,
  ajustás la regla ahí y volvés a correr el import.
- **El precio** no está en la planilla, así que todas las fichas dicen
  "Consultá por WhatsApp".

---

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de producción
npm run typecheck    # chequeo de tipos
```

## Deploy en Vercel

El proyecto ya está creado y enlazado al repo: **cada push a `main` publica una
versión nueva automáticamente**. No hay que hacer nada más.

- Proyecto: `carrimotos` (equipo *Sistema de stock*)
- Dominio: `carrimotos.com.ar` (con `www` redirigiendo al dominio sin www)
- URL de Vercel: https://carrimotos-sistema-de-stock.vercel.app

Si algún día cambia el dominio, actualizá `NEGOCIO.sitio` en
`data/sucursales.ts`: de ahí salen el canonical, el sitemap y los metadatos
para compartir en redes.

---

## Estructura

```
app/
  page.tsx              portada
  catalogo/             catálogo con filtros
  moto/[slug]/          ficha de cada modelo (una página por moto)
  accesorios/           accesorios con precios
  sucursales/           las tres sucursales
components/             header, footer, tarjetas, botones de WhatsApp
data/
  motos.ts              GENERADO desde la planilla
  accesorios.ts         GENERADO desde la planilla
  sucursales.ts         ← los tres contactos, se edita a mano
lib/                    helpers de catálogo, WhatsApp y formato
scripts/
  import-catalogo.mjs   el importador (lee scripts/catalogo.xlsx, no versionado)
public/motos/           las fotos de los modelos
```
