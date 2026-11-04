'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl font-semibold">No pudimos cargar esta página</h1>
      <p className="my-6">Intentá nuevamente en unos instantes.</p>
      <button onClick={reset} className="rounded-lg border px-5 py-3">
        Volver a intentar
      </button>
    </main>
  );
}
