import type { Metadata } from 'next';
import IconoWhatsApp from '@/components/IconoWhatsApp';
import IconoInstagram from '@/components/IconoInstagram';
import { contactoDe, linkInstagram, SUCURSALES } from '@/data/sucursales';
import { consultaGeneral } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Sucursales',
  description: 'Nuestras tres sucursales de CARRI Motos y cómo contactarlas.',
};

export default function SucursalesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <h1 className="titulo text-3xl text-mist-50 sm:text-5xl">Sucursales</h1>
        <p className="mt-3 max-w-2xl text-sm text-mist-400 sm:text-base">
          Tenemos tres locales. Escribinos al que te quede más cerca.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {SUCURSALES.map((s) => {
          const canal = consultaGeneral(s);
          const esWhatsApp = canal.tipo === 'whatsapp';

          return (
            <article key={s.slug} className="flex flex-col rounded-xl border border-ink-700 bg-ink-850 p-6">
              <h2 className="titulo text-xl text-mist-50">{s.nombre}</h2>

              <dl className="mt-5 flex-1 space-y-4 text-sm">
                {(s.direccion || s.ciudad) && (
                  <div className="flex gap-3">
                    <Icono d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11m0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5" />
                    <div>
                      <dt className="sr-only">Dirección</dt>
                      {s.direccion && <dd className="text-mist-200">{s.direccion}</dd>}
                      {s.ciudad && <dd className="text-mist-400">{s.ciudad}</dd>}
                    </div>
                  </div>
                )}

                {s.horarios && (
                  <div className="flex gap-3">
                    <Icono d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20m0-16v6l4 2" />
                    <div>
                      <dt className="sr-only">Horarios</dt>
                      <dd className="text-mist-400">{s.horarios}</dd>
                    </div>
                  </div>
                )}

                {s.vendedor && (
                  <div className="flex gap-3">
                    <Icono d="M16 3.1a4 4 0 1 1-8 0M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
                    <div>
                      <dt className="sr-only">Vendedor</dt>
                      <dd className="text-mist-200">Te atiende {s.vendedor}</dd>
                      {s.telefonoVisible && <dd className="text-mist-400">{s.telefonoVisible}</dd>}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <IconoInstagram className="mt-0.5 h-4 w-4 shrink-0 text-carri" />
                  <div>
                    <dt className="sr-only">Instagram</dt>
                    <dd>
                      <a
                        href={linkInstagram(s)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mist-200 transition-colors hover:text-carri"
                      >
                        @{s.instagram}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={canal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="titulo flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs tracking-widest text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: esWhatsApp ? '#25D366' : '#E1306C' }}
                >
                  {esWhatsApp ? <IconoWhatsApp className="h-4 w-4" /> : <IconoInstagram className="h-4 w-4" />}
                  Escribir a {contactoDe(s)}
                </a>

                {s.mapsUrl && (
                  <a
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="titulo rounded-lg border border-ink-700 px-5 py-3 text-center text-xs tracking-widest text-mist-200 transition-colors hover:border-mist-500"
                  >
                    Cómo llegar
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Icono({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 h-4 w-4 shrink-0 text-carri"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
