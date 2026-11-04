import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { tokens } from '@pucara/design-tokens';
import { Brand } from '../components/brand';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Pucará Digital', template: '%s · Pucará Digital' },
  description: 'Tu club, más cerca. La experiencia digital de Pucará.',
  robots: { index: false, follow: false },
};

const theme = Object.fromEntries(
  Object.entries(tokens.color).map(([key, value]) => [`--color-${key}`, value]),
) as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" style={theme}>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <header className="site-header shell">
          <Brand />
          <nav aria-label="Navegación principal">
            <Link className="text-link" href="/experiencia">
              La experiencia <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </header>
        <div className="demo-notice">
          <span className="status-dot" aria-hidden="true" />
          Modo demo · Primera etapa en desarrollo
        </div>
        {children}
        <footer className="site-footer shell">
          <p>Un club. Toda una comunidad.</p>
          <span>Desarrollado por Suplio</span>
        </footer>
      </body>
    </html>
  );
}
