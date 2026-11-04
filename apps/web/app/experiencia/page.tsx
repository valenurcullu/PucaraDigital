import type { Metadata } from 'next';
import Link from 'next/link';
import { plannedExperience } from '@pucara/shared';

export const metadata: Metadata = { title: 'La experiencia' };

export default function ExperiencePage() {
  return (
    <main id="contenido" className="experience shell">
      <Link className="text-link back-link" href="/">
        ← Volver al inicio
      </Link>
      <div className="experience-intro">
        <div>
          <p className="eyebrow">Lo que viene</p>
          <h1 className="page-heading">
            Tu vida en el club.
            <br />
            <em>A tu manera.</em>
          </h1>
        </div>
        <p className="lead">
          Cinco espacios para que lo cotidiano sea más simple. Esta es la
          estructura que estamos preparando para vos.
        </p>
      </div>
      <ol className="experience-list">
        {plannedExperience.map((item) => (
          <li key={item.key} className="experience-row">
            <span className="row-number" aria-hidden="true">
              {item.number}
            </span>
            <div>
              <h2>{item.name}</h2>
              <p className="row-summary">{item.summary}</p>
            </div>
            <p className="row-detail">{item.detail}</p>
          </li>
        ))}
      </ol>
      <p className="planned-note">
        Vista previa informativa. Estas secciones están en desarrollo y todavía
        no permiten consultar datos de socios ni realizar operaciones.
      </p>
    </main>
  );
}
