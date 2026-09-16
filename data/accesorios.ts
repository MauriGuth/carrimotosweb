// ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR A MANO.
// Se genera con: npm run import:catalogo  (fuente: scripts/catalogo.xlsx)

export type Accesorio = {
  nombre: string;
  /** Precio en pesos, tal cual figura en la planilla. */
  precio: number;
};

export type GrupoAccesorios = {
  slug: string;
  categoria: string;
  items: Accesorio[];
};

export const ACCESORIOS: GrupoAccesorios[] = [
  {
    slug: "cascos",
    categoria: "CASCOS",
    items: [
      { nombre: "CASCO INTEGRAL HALCON", precio: 43900 },
      { nombre: "CASCO JUST J34 ADVENTURE CROSS SHAPE", precio: 430600 },
      { nombre: "CASCO JUST J39 POSEIDON", precio: 329400 },
      { nombre: "CASCO MAC", precio: 230600 },
      { nombre: "CASCO V50", precio: 132000 },
      { nombre: "CASCO ROCKWELL", precio: 155000 },
      { nombre: "CASCOS TAMASHI/ LINE VERTIGO", precio: 55000 },
      { nombre: "CASCO ROSADO H57", precio: 70000 },
    ],
  },
  {
    slug: "guantes",
    categoria: "GUANTES",
    items: [
      { nombre: "GUANTES CITY", precio: 58000 },
      { nombre: "GUANTES NTO WINDB. EVO H NG", precio: 122800 },
      { nombre: "GUANTES COMUN", precio: 25500 },
    ],
  },
  {
    slug: "lingas",
    categoria: "LINGAS",
    items: [
      { nombre: "TRABA ONGUARD PITBULL", precio: 82200 },
      { nombre: "LINGA ONGUARD ROTTWEILER", precio: 122000 },
      { nombre: "LINGA ONGUARD MASTIFF", precio: 188100 },
      { nombre: "LINGA COMUN", precio: 23630 },
    ],
  },
  {
    slug: "antiparras",
    categoria: "ANTIPARRAS",
    items: [
      { nombre: "ANTIPARRAS ANTIFOG ESPEJADO", precio: 77400 },
      { nombre: "VICTORY ANTIFOG ESPEJADO", precio: 77400 },
      { nombre: "VISOR", precio: 32300 },
    ],
  },
  {
    slug: "aceites",
    categoria: "ACEITES",
    items: [
      { nombre: "HGO SEMI 10W30 4T", precio: 22000 },
      { nombre: "HACEITE YAMALUBE 20W40 MINERAL", precio: 22000 },
      { nombre: "ACEITE PUMA", precio: 11760 },
    ],
  },
];
