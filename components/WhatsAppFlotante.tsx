'use client';

import { useEffect, useState } from 'react';
import { contactoDe, SUCURSALES } from '@/data/sucursales';
import { consultaGeneral } from '@/lib/whatsapp';
import IconoWhatsApp from './IconoWhatsApp';
import IconoInstagram from './IconoInstagram';

const ESTILO = {
  whatsapp: { color: '#25D366', nombre: 'WhatsApp', Icono: IconoWhatsApp },
  instagram: { color: '#E1306C', nombre: 'Instagram', Icono: IconoInstagram },
} as const;

/** Botón fijo que despliega los contactos de las tres sucursales. */
export default function WhatsAppFlotante() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alEscape = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', alEscape);
    return () => document.removeEventListener('keydown', alEscape);
  }, []);

  // Si ya hay algún WhatsApp cargado, el botón flotante es verde de WhatsApp.
  const hayWhatsApp = SUCURSALES.some((s) => s.whatsapp);
  const principal = hayWhatsApp ? ESTILO.whatsapp : ESTILO.instagram;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {abierto && (
        <div className="w-[17rem] overflow-hidden rounded-xl border border-ink-700 bg-ink-850 shadow-2xl shadow-black/60">
          <p className="titulo border-b border-ink-700 px-4 py-3 text-xs tracking-widest text-mist-400">
            Escribinos
          </p>
          {SUCURSALES.map((s) => {
            const canal = consultaGeneral(s);
            const { color, nombre, Icono } = ESTILO[canal.tipo];
            return (
              <a
                key={s.slug}
                href={canal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border-b border-ink-800 px-4 py-3 last:border-0 transition-colors hover:bg-ink-800"
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{ backgroundColor: `${color}26`, color }}
                >
                  <Icono className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-mist-50">{contactoDe(s)}</span>
                  <span className="block truncate text-xs text-mist-400">{nombre}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar contactos' : 'Abrir contactos'}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: principal.color }}
      >
        {abierto ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <principal.Icono className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
