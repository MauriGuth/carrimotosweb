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

### 1b. Mientras falten los WhatsApp, el sitio no se indexa

El sitio se publica con `noindex` hasta que las tres sucursales tengan su
número cargado. Se puede ver y compartir el link, pero no aparece en Google: no
tiene sentido indexar un catálogo cuyo botón de contacto todavía no lleva al
teléfono real.

**Se reactiva solo.** `SITIO_INDEXABLE` en `data/sucursales.ts` se calcula a
partir de los datos, así que en cuanto estén los tres números el siguiente
deploy sale indexable. No hay ningún interruptor que acordarse de prender, y el
build de Vercel avisa en el log mientras el `noindex` siga activo.

Un detalle: el `robots.txt` **permite** el rastreo incluso con el `noindex`
puesto. Es a propósito. Si se bloqueara con un `Disallow`, el robot no podría
leer la etiqueta `noindex` y Google podría indexar la URL igual, sin
descripción. Lo que sí se saca mientras tanto es el sitemap.

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

**De dónde salen las fotos.** Las fotos de producto con fondo blanco son
material con derechos de las terminales y los importadores. La vía correcta es
pedirles el kit de prensa o el acceso a su portal de imágenes: ustedes venden
esas motos y ese material existe justamente para la red de concesionarios. No
hay que bajarlas de Google ni de la web de otro concesionario.

Para armar el pedido:

```bash
npm run fotos:faltan              # cuántas faltan, por marca
node scripts/pedido-fotos.mjs --texto   # el texto a mandarle a cada importador
node scripts/pedido-fotos.mjs --csv     # planilla marca / modelo / archivo
```

**Cada modelo puede tener varias fotos.** En la ficha se ven como galería, con
miniaturas; la primera es la que va en la tarjeta del catálogo.

**Cómo cargarlas.** No hace falta renombrar ni editar nada a mano:

1. Poné las fotos en `fotos-crudas/` (esa carpeta no se sube al repo), de una
   de estas dos formas:

   ```
   fotos-crudas/gilera-sahel-150/     ← una carpeta por modelo, con el slug
     IMG_4471.jpg                        de nombre. Todas van a ese modelo,
     IMG_4472.jpg                        ordenadas por nombre de archivo.

   fotos-crudas/Honda CB 300 Twister.jpg  ← o sueltas: el script adivina el
                                             modelo por el nombre del archivo.
   ```

2. Corré `npm run fotos`.
3. Salen en `public/motos/<slug>/1.jpg, 2.jpg…` (o `<slug>.jpg` si es una
   sola), en 1200×900 y comprimidas.

El script distingue solo entre dos tipos de foto: si detecta fondo blanco de
estudio recorta el aire y centra la moto sobre blanco; si es una foto del salón
recorta al encuadre 4:3, sin barras blancas.

Lo que no puede emparejar con confianza lo deja sin tocar y te lo informa, en
vez de arriesgarse a cargar una foto en el modelo equivocado: en ese caso
renombralo incluyendo marca y modelo, o ponelo en una carpeta con el slug.

El índice de fotos (`data/fotos.ts`) lo regenera el mismo comando: el navegador
no puede listar una carpeta, así que la web necesita ese archivo para saber
cuántas fotos tiene cada moto. No se edita a mano.

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

## Fichas técnicas

Cada modelo puede tener su ficha: motor, refrigeración, rodados, frenos,
tanque, medidas, garantía y equipamiento. En la ficha del modelo se muestra en
dos columnas, y **sólo aparecen los campos cargados**: si de una moto se conoce
el motor pero no la velocidad máxima, esa fila no se muestra en vez de quedar
en blanco. Los modelos sin ficha cargada no muestran la sección.

**De dónde salen los datos.** De las fichas oficiales de cada terminal, la
misma fuente que las fotos. No se copian de la web de otro concesionario: si
ellos tienen un dato mal, lo publicaríamos nosotros, y las especificaciones
cambian entre años y versiones del mismo modelo.

**Cómo cargarlas:**

1. `npm run ficha:plantilla` genera `plantilla-ficha-tecnica.xlsx`, con una
   fila por modelo y una columna por campo. Las fichas ya cargadas vienen
   completas, así que sirve también para revisar lo que hay.
2. Se completa con los datos oficiales.
3. Se pega como hoja **FICHA** en `scripts/catalogo.xlsx`.
4. `npm run import:catalogo` regenera `data/fichas.ts`.

Si la planilla no trae hoja FICHA, el import deja `data/fichas.ts` intacto: no
se pierden las fichas ya cargadas al reemplazar la planilla por una nueva.

Para agregar un campo que no está (por ejemplo, "Embrague"), se suma a
`CAMPOS_FICHA` en `data/campos-ficha.ts` y se agrega la columna con ese mismo
nombre en la hoja FICHA. El tipo, el importador, la plantilla y la tabla de la
web salen todos de esa lista.

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
