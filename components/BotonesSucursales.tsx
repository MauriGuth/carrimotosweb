import { contactoDe, SUCURSALES, type Sucursal } from '@/data/sucursales';
import { consultaGeneral, consultaPorAccesorio, consultaPorMoto, type Canal } from '@/lib/whatsapp';
import IconoWhatsApp from './IconoWhatsApp';
import IconoInstagram from './IconoInstagram';

type Props = {
  /** Si se pasa un modelo, el mensaje de WhatsApp ya viene escrito con ese modelo. */
  moto?: string;
  accesorio?: string;
  /** 'tarjetas' para la ficha de producto, 'lista' para bloques más compactos. */
  formato?: 'tarjetas' | 'lista';
};

/** Color y textos según el canal por el que se contacta a la sucursal. */
export const ESTILO_CANAL = {
  whatsapp: { color: '#25D366', nombre: 'WhatsApp', Icono: IconoWhatsApp },
  instagram: { color: '#E1306C', nombre: 'Instagram', Icono: IconoInstagram },
} as const;

/**
 * Los contactos de las tres sucursales. Cada uno abre WhatsApp con el mensaje
 * ya escrito; si esa sucursal todavía no tiene número cargado, abre su
 * Instagram en lugar de un link roto.
 */
export default function BotonesSucursales({ moto, accesorio, formato = 'tarjetas' }: Props) {
  const canalDeSucursal = (sucursal: Sucursal): Canal => {
    if (moto) return consultaPorMoto(sucursal, moto);
    if (accesorio) return consultaPorAccesorio(sucursal, accesorio);
    return consultaGeneral(sucursal);
  };

  if (formato === 'lista') {
    return (
      <div className="flex flex-col gap-2">
        {SUCURSALES.map((s) => {
          const canal = canalDeSucursal(s);
          const { color, nombre, Icono } = ESTILO_CANAL[canal.tipo];
          return (
            <a
              key={s.slug}
              href={canal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850 px-4 py-3 transition-colors hover:bg-ink-800"
              style={{ ['--canal' as string]: color }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: `${color}26`, color }}
              >
                <Icono className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-mist-50">{contactoDe(s)}</span>
                <span className="block truncate text-xs text-mist-400">Escribir por {nombre}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                className="ml-auto h-4 w-4 shrink-0 text-mist-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SUCURSALES.map((s) => {
        const canal = canalDeSucursal(s);
        const { color, nombre, Icono } = ESTILO_CANAL[canal.tipo];
        return (
          <a
            key={s.slug}
            href={canal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 rounded-xl border border-ink-700 bg-ink-850 p-4 transition-all hover:-translate-y-0.5 hover:bg-ink-800"
          >
            <span className="flex items-center gap-2" style={{ color }}>
              <Icono className="h-5 w-5" />
              <span className="titulo text-xs tracking-widest">{nombre}</span>
            </span>
            <span className="text-base font-semibold text-mist-50">{contactoDe(s)}</span>
            {s.ciudad && <span className="text-sm text-mist-400">{s.ciudad}</span>}
            <span className="mt-auto pt-1 text-xs text-mist-500 group-hover:text-mist-400">
              {s.telefonoVisible ?? `@${s.instagram}`}
            </span>
          </a>
        );
      })}
    </div>
  );
}
