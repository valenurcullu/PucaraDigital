import Link from 'next/link';
import {
  createDemoClubService,
  demoClub,
  requireDemoMode,
} from '@pucara/shared';

export default async function Home() {
  requireDemoMode(process.env.NEXT_PUBLIC_DATA_MODE);
  const club = await createDemoClubService().getClub(demoClub.id);
  return (
    <main id="contenido">
      <section className="hero shell" aria-labelledby="welcome-title">
        <div>
          <p className="eyebrow">Bienvenido a {club.name} Digital</p>
          <h1 id="welcome-title">
            Tu club,
            <br />
            <em>más cerca.</em>
          </h1>
          <p className="lead">
            Hay cosas que nos unen. Una camiseta, un equipo, un lugar al que
            siempre queremos volver.
          </p>
          <Link href="/experiencia" className="button">
            Conocé la experiencia <span aria-hidden="true">↗</span>
          </Link>
          <p className="caption hero-note">
            Una primera mirada a lo que estamos construyendo.
          </p>
        </div>
        <aside className="editorial-panel" aria-label="Nuestra comunidad">
          <div className="panel-top">Pertenecer se vive todos los días</div>
          <blockquote>
            En la cancha.
            <br />
            En la tribuna.
            <br />
            En cada encuentro.
          </blockquote>
          <div className="panel-bottom">
            <span>
              El mismo club.
              <br />
              Una nueva forma de estar cerca.
            </span>
            <span aria-hidden="true">
              PUCARÁ
              <br />
              DIGITAL
            </span>
          </div>
        </aside>
      </section>
      <section
        className="intro-section shell"
        aria-labelledby="community-title"
      >
        <span className="section-kicker">Pensado para nuestra comunidad</span>
        <div>
          <h2 id="community-title">
            Más tiempo para disfrutar.
            <br />
            Todo lo importante, en un lugar.
          </h2>
          <p>
            Estamos preparando una experiencia simple para acompañar tu vida en
            el club: organizar tu semana, descubrir actividades y tener tu
            información a mano.
          </p>
          <ul className="sports" aria-label="Actividades del club">
            {['Rugby', 'Hockey', 'Gimnasio', 'Yoga', 'Funcional'].map(
              (sport) => (
                <li key={sport}>{sport}</li>
              ),
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
