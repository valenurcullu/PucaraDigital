import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Pucará Digital, ir al inicio">
      <span className="brand-mark" aria-hidden="true">
        P
      </span>
      <span className="brand-name">
        PUCARÁ<span>DIGITAL</span>
      </span>
    </Link>
  );
}
