import { CAMPOS_FICHA, type FichaTecnica as Ficha } from '@/data/campos-ficha';

/**
 * Ficha técnica en dos columnas. Muestra sólo los campos cargados: si de un
 * modelo se conoce el motor pero no la velocidad máxima, esa fila no aparece,
 * en vez de quedar en blanco.
 */
export default function FichaTecnica({ ficha, nombre }: { ficha: Ficha; nombre: string }) {
  const filas = CAMPOS_FICHA.filter((c) => ficha[c.clave]).map((c) => ({
    etiqueta: c.etiqueta,
    valor: ficha[c.clave] as string,
  }));

  if (!filas.length) return null;

  // El equipamiento suele ser un texto largo: va aparte, a todo el ancho.
  const equipamiento = filas.find((f) => f.etiqueta === 'Equipamiento');
  const resto = filas.filter((f) => f !== equipamiento);
  const mitad = Math.ceil(resto.length / 2);
  const columnas = [resto.slice(0, mitad), resto.slice(mitad)];

  return (
    <section className="mt-16 border-t border-ink-700 pt-12">
      <h2 className="titulo mb-2 text-2xl text-mist-50">Ficha técnica</h2>
      <p className="mb-8 text-sm text-mist-400">Datos de {nombre} según la ficha oficial de la marca.</p>

      <div className="grid gap-x-10 lg:grid-cols-2">
        {columnas.map((columna, i) => (
          <dl key={i}>
            {columna.map((f, j) => (
              <div
                key={f.etiqueta}
                className={`flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-800 py-3.5 text-sm ${
                  // La última fila de la primera columna no lleva línea en
                  // pantallas anchas, donde las columnas van una al lado de otra.
                  j === columna.length - 1 ? 'lg:border-b-0' : ''
                }`}
              >
                <dt className="font-medium text-mist-300">{f.etiqueta}</dt>
                <dd className="text-right text-mist-50">{f.valor}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>

      {equipamiento && (
        <div className="mt-6 rounded-xl border border-ink-700 bg-ink-850 p-5">
          <p className="titulo mb-2 text-xs tracking-widest text-carri">Equipamiento</p>
          <p className="text-sm text-mist-100">{equipamiento.valor}</p>
        </div>
      )}
    </section>
  );
}
