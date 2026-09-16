import { SUCURSALES } from '@/data/sucursales';
import { consultaGeneral, consultaPorAccesorio, consultaPorMoto } from '@/lib/whatsapp';
import IconoWhatsApp from './IconoWhatsApp';

type Props = {
  /** Si se pasa un modelo, el mensaje de WhatsApp ya viene escrito con ese modelo. */
  moto?: string;
  accesorio?: string;
  /** 'tarjetas' para la ficha de producto, 'lista' para bloques más compactos. */
  formato?: 'tarjetas' | 'lista';
};

/**
 * Los tres contactos de WhatsApp, cada uno con su vendedor y su sucursal.
 * El texto del mensaje cambia según desde dónde se abre.
 */
export default function BotonesSucursales({ moto, accesorio, formato = 'tarjetas' }: Props) {
  const linkDe = (sucursal: (typeof SUCURSALES)[number]) => {
    if (moto) return consultaPorMoto(sucursal, moto);
    if (accesorio) return consultaPorAccesorio(sucursal, accesorio);
    return consultaGeneral(sucursal);
  };

  if (formato === 'lista') {
    return (
      <div className="flex flex-col gap-2">
        {SUCURSALES.map((s) => (
          <a
            key={s.slug}
            href={linkDe(s)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850 px-4 py-3 transition-colors hover:border-[#25D366]/60 hover:bg-ink-800"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">
              <IconoWhatsApp className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-mist-50">{s.vendedor}</span>
              <span className="block truncate text-xs text-mist-400">{s.nombre}</span>
            </span>
            <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4 shrink-0 text-mist-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SUCURSALES.map((s) => (
        <a
          key={s.slug}
          href={linkDe(s)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-2 rounded-xl border border-ink-700 bg-ink-850 p-4 transition-all hover:-translate-y-0.5 hover:border-[#25D366]/60 hover:bg-ink-800"
        >
          <span className="flex items-center gap-2 text-[#25D366]">
            <IconoWhatsApp className="h-5 w-5" />
            <span className="titulo text-xs tracking-widest">WhatsApp</span>
          </span>
          <span className="text-base font-semibold text-mist-50">{s.vendedor}</span>
          <span className="text-sm text-mist-400">{s.nombre}</span>
          <span className="mt-auto pt-1 text-xs text-mist-500 group-hover:text-mist-400">{s.telefonoVisible}</span>
        </a>
      ))}
    </div>
  );
}
