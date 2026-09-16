import type { Metadata } from 'next';
import BotonesSucursales from '@/components/BotonesSucursales';
import Revelar from '@/components/Revelar';
import { ACCESORIOS } from '@/data/accesorios';
import { capitalizar, precio } from '@/lib/formato';

export const metadata: Metadata = {
  title: 'Accesorios',
  description: 'Cascos, guantes, lingas, antiparras y aceites disponibles en CARRI Motos.',
};

export default function AccesoriosPage() {
  const total = ACCESORIOS.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Revelar inmediato escalonar y={20} className="mb-10">
        <h1 className="titulo text-3xl text-mist-50 sm:text-5xl">Accesorios</h1>
        <p className="mt-3 max-w-2xl text-sm text-mist-400 sm:text-base">
          {total} artículos disponibles. Los precios pueden variar: confirmalos por WhatsApp antes de pasar a buscarlos.
        </p>
      </Revelar>

      <Revelar escalonar y={24} className="grid gap-6 lg:grid-cols-2">
        {ACCESORIOS.map((grupo) => (
          <section key={grupo.slug} className="overflow-hidden rounded-xl border border-ink-700">
            <h2 className="titulo border-b border-ink-700 bg-ink-850 px-5 py-4 text-sm tracking-widest text-carri">
              {capitalizar(grupo.categoria)}
            </h2>
            <ul>
              {grupo.items.map((item, i) => (
                <li
                  key={item.nombre}
                  className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm ${
                    i % 2 === 0 ? 'bg-ink-900' : 'bg-ink-850'
                  }`}
                >
                  <span className="text-mist-200">{capitalizar(item.nombre)}</span>
                  <span className="titulo shrink-0 text-mist-50">{precio(item.precio)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Revelar>

      <section className="mt-14">
        <h2 className="titulo mb-2 text-2xl text-mist-50">¿Querés alguno?</h2>
        <p className="mb-6 text-sm text-mist-400">Escribinos y te confirmamos stock y precio del día.</p>
        <Revelar escalonar y={20}>
          <BotonesSucursales />
        </Revelar>
      </section>
    </div>
  );
}
