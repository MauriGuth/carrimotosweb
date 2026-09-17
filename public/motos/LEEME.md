# Fotos de las motos

Esta carpeta es **resultado**, no entrada: la escribe `npm run fotos`. No pongas
fotos acá a mano, porque el script borra lo que había del modelo que procesa.

## Cómo cargar fotos

1. Descomprimí el zip del importador en `fotos-crudas/` (esa carpeta no va al
   repo). Sirven estas tres formas:

   ```
   fotos-crudas/BAJAJ/BAJAJ - ROUSER NS 200/…   ← tal cual viene el zip
   fotos-crudas/gilera-sahel-150/…              ← una carpeta con el slug
   fotos-crudas/Honda CB 300 Twister.jpg        ← sueltas, por nombre de archivo
   ```

2. `npm run fotos`

El script empareja cada carpeta con su modelo, deja todo en 1200×900 (más una
copia de 400×300 en `mini/` para las tarjetas) y regenera `data/fotos.ts`, que
es lo que lee la web. Si algo no lo pudo emparejar, lo lista al final en vez de
adivinar.

Dos tipos de foto, que detecta solo:

- **Recorte de estudio** — fondo transparente o blanco. Lo recorta y lo centra
  sobre blanco, para que todas las motos queden del mismo tamaño relativo.
- **Foto de verdad** — salón, calle, pista. La recorta al encuadre 4:3.

## Orden de la galería

La primera foto de cada modelo es la que sale en la tarjeta del catálogo, así
que conviene que sea la moto entera. Los zips suelen traer los primeros planos
mezclados en el medio: para acomodarlos está `data/orden-fotos.ts`.

## Qué pasa si un modelo no tiene fotos

La web muestra un placeholder con la marca. Para saber cuáles faltan:
`npm run fotos:faltan`.
