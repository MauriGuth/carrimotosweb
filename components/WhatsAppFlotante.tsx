'use client';

import { useEffect, useState } from 'react';
import { SUCURSALES } from '@/data/sucursales';
import { consultaGeneral } from '@/lib/whatsapp';
import IconoWhatsApp from './IconoWhatsApp';

/** Botón fijo de WhatsApp que despliega los tres contactos. */
export default function WhatsAppFlotante() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alEscape = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', alEscape);
    return () => document.removeEventListener('keydown', alEscape);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {abierto && (
        <div className="w-[17rem] overflow-hidden rounded-xl border border-ink-700 bg-ink-850 shadow-2xl shadow-black/60">
          <p className="titulo border-b border-ink-700 px-4 py-3 text-xs tracking-widest text-mist-400">
            Escribinos por WhatsApp
          </p>
          {SUCURSALES.map((s) => (
            <a
              key={s.slug}
              href={consultaGeneral(s)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border-b border-ink-800 px-4 py-3 last:border-0 transition-colors hover:bg-ink-800"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                <IconoWhatsApp className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-mist-50">{s.vendedor}</span>
                <span className="block truncate text-xs text-mist-400">{s.nombre}</span>
              </span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar contactos de WhatsApp' : 'Abrir contactos de WhatsApp'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 active:scale-95"
      >
        {abierto ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <IconoWhatsApp className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
