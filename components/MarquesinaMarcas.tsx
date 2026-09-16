import Link from 'next/link';
import { slugMarca } from '@/lib/catalogo';

type Marca = { marca: string; total: number };

function Fila({ marcas, duplicada }: { marcas: Marca[]; duplicada: boolean }) {
  return (
    <ul
      className="anim-marquesina flex shrink-0 items-center gap-3 pr-3"
      // La segunda copia existe sólo para que el bucle no tenga corte:
      // se oculta a lectores de pantalla y se saca del tabulado.
      aria-hidden={duplicada || undefined}
    >
      {marcas.map((m) => (
        <li key={m.marca}>
          <Link
            href={`/catalogo/marca/${slugMarca(m.marca)}`}
            tabIndex={duplicada ? -1 : undefined}
            className="titulo flex items-center gap-2 whitespace-nowrap rounded-lg border border-ink-700 bg-ink-850 px-5 py-3.5 text-sm tracking-wide text-mist-200 transition-colors hover:border-carri hover:text-carri"
          >
            {m.marca}
            <span className="text-xs text-mist-500">{m.total}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Cinta de marcas que se desplaza sola. La lista va duplicada y la animación
 * corre hasta -50%, así el corte no se nota nunca. Es CSS puro: no necesita
 * JavaScript y se frena al pasar el mouse por encima.
 */
export default function MarquesinaMarcas({ marcas }: { marcas: Marca[] }) {
  return (
    <div
      className="marquesina-contenedor relative flex overflow-hidden"
      // Difumina los bordes para que las marcas entren y salgan sin cortarse.
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
      }}
    >
      <Fila marcas={marcas} duplicada={false} />
      <Fila marcas={marcas} duplicada />
    </div>
  );
}
