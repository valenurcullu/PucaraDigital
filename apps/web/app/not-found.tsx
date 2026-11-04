import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="contenido" className="mx-auto max-w-xl px-6 py-20">
      <p>404</p>
      <h1 className="my-6 text-3xl font-semibold">
        Esta página no está disponible
      </h1>
      <Link href="/" className="underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
