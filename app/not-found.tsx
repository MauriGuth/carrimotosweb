import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="titulo text-6xl text-carri">404</p>
      <h1 className="titulo mt-4 text-2xl text-mist-50 sm:text-3xl">No encontramos esta página</h1>
      <p className="mt-3 text-sm text-mist-400">
        Puede que el modelo ya no esté en el catálogo o que el link esté mal escrito.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogo"
          className="titulo rounded-lg bg-carri px-6 py-3 text-xs tracking-widest text-white transition-colors hover:bg-carri-hi"
        >
          Ver catálogo
        </Link>
        <Link
          href="/"
          className="titulo rounded-lg border border-ink-600 px-6 py-3 text-xs tracking-widest text-mist-100 transition-colors hover:border-mist-400"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
