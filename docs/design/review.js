/* Review-only prototype. In-memory scenarios; no backend or persistent storage. */
(() => {
  'use strict';
  const theme = document.body.dataset.concept || 'a';
  const themes = {
    a: {
      name: 'Club editorial',
      tagline: 'Un lugar al que siempre volvés.',
      intro:
        'Cálida, editorial y con espacio para leer. La vida del club se organiza como una agenda cercana.',
    },
    b: {
      name: 'Pulso deportivo',
      tagline: 'Somos parte. Somos Pucará.',
      intro:
        'Marino profundo, ritmo compacto y carácter deportivo. Las acciones frecuentes están al frente.',
    },
    c: {
      name: 'Club cotidiano',
      tagline: 'Más club. Menos vueltas.',
      intro:
        'Servicios claros, superficies suaves y una jerarquía amable para todas las edades.',
    },
  };
  const paths = {
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    card: '<rect x="2" y="4" width="20" height="16" rx="3"/><circle cx="8" cy="10" r="2"/><path d="M5 16h6m3-6h5m-5 5h5"/>',
    club: '<path d="M3 21V9l9-6 9 6v12M2 21h20M8 21v-7h8v7M7 9h10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    racket:
      '<ellipse cx="14" cy="9" rx="6" ry="7" transform="rotate(35 14 9)"/><path d="m10 14-7 8m7-17 8 8m-5-10 8 8m-13-1 8-8m-5 13 10-10"/>',
    gym: '<path d="M3 8v8m4-11v14m10-14v14m4-11v14M7 12h10"/>',
    money:
      '<rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="12" cy="12" r="3"/><path d="M5 12h1m12 0h1"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    leaf: '<path d="M20 3C7 2 2 9 6 16c7 5 15-1 14-13ZM4 21 16 8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    ball: '<ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-35 12 12)"/><path d="m8 14 8-5m-6 2 2 3m1-5 2 3"/>',
    check: '<path d="m5 12 4 4L20 5"/>',
    pin: '<path d="M12 22s8-8 8-14a8 8 0 0 0-16 0c0 6 8 14 8 14Z"/><circle cx="12" cy="8" r="2"/>',
  };
  const icon = (name) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (paths[name] || paths.arrow) +
    '</svg>';
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const btn = (label, action, value = '', cls = 'primary') =>
    '<button type="button" class="' +
    cls +
    '" data-action="' +
    action +
    '" data-value="' +
    esc(value) +
    '">' +
    label +
    '</button>';
  const link = (label, route, cls = 'text-button') =>
    btn(label, 'go', route, cls);
  const day = (date) =>
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(date + 'T12:00:00Z'));
  const addDays = (date, n) => {
    const d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const activityDates = {
    yoga: ['2026-11-09', '2026-11-12', '2026-11-16', '2026-11-19'],
    funcional: ['2026-11-10', '2026-11-13', '2026-11-17', '2026-11-20'],
  };
  const activities = {
    yoga: {
      name: 'Yoga',
      schedule: 'Lunes y jueves · 18:00–19:00',
      time: '18:00',
      place: 'Salón de actividades',
      teacher: 'Equipo de profesores · ejemplo',
      desc: 'Un momento para respirar, moverte y encontrar equilibrio.',
      icon: 'leaf',
    },
    funcional: {
      name: 'Funcional',
      schedule: 'Martes y viernes · 19:00–20:00',
      time: '19:00',
      place: 'Espacio de entrenamiento',
      teacher: 'Equipo de profesores · ejemplo',
      desc: 'Fuerza, movilidad y energía para tu día a día.',
      icon: 'gym',
    },
  };
  const matches = [
    {
      id: 'rugby',
      sport: 'Rugby',
      rival: 'Club del Sur',
      side: 'Local',
      date: '2026-11-07',
      time: '15:30',
      place: 'Cancha principal · Pucará',
    },
    {
      id: 'hockey',
      sport: 'Hockey',
      rival: 'Club del Parque',
      side: 'Visitante',
      date: '2026-11-08',
      time: '16:00',
      place: 'Cancha de Club del Parque',
    },
  ];
  const people = { alex: 'Alex Modelo', luca: 'Luca Modelo · menor' };
  let state;
  function reset() {
    state = {
      route: 'home',
      trail: [],
      activeTab: 'home',
      flash: '',
      flashType: 'info',
      kind: 'padel',
      date: '2026-11-06',
      slot: '',
      editing: null,
      selected: null,
      participant: 'alex',
      activity: 'yoga',
      enrolled: new Set(),
      approval: true,
      quinchoPay: false,
      full: false,
      agendaView: 'week',
      agendaWeek: '2026-11-02',
      agendaDate: '2026-11-06',
      publicMatches: false,
      persona: 'social',
      blocked: new Set(),
      reservations: [
        {
          id: 1,
          kind: 'padel',
          date: '2026-11-06',
          slot: '18:00–19:30',
          status: 'confirmed',
          paid: true,
        },
        {
          id: 2,
          kind: 'quincho',
          date: '2026-11-08',
          slot: '12:00–16:00',
          status: 'pending',
          paid: false,
          paymentRequired: false,
        },
      ],
    };
  }
  reset();
  const kindName = (k) =>
    k === 'padel' ? 'Pádel · Cancha 1' : 'Quincho · Los Tilos';
  const cost = (k) => (k === 'padel' ? '$18.000' : '$45.000');
  const statusName = (s) =>
    ({
      confirmed: 'Confirmada',
      pending: 'Pendiente de aprobación',
      payment: 'Pendiente de pago',
      cancelled: 'Cancelada',
      rejected: 'Solicitud rechazada',
    })[s];
  const badge = (label, cls = '') =>
    '<span class="badge ' + cls + '">' + label + '</span>';
  const heading = (eyebrow, title, sub = '') =>
    '<header class="page-heading"><span class="eyebrow">' +
    eyebrow +
    '</span><h1 tabindex="-1">' +
    title +
    '</h1>' +
    (sub ? '<p>' + sub + '</p>' : '') +
    '</header>';
  const sectionTitle = (title, action = '') =>
    '<div class="section-title"><h2>' + title + '</h2>' + action + '</div>';
  const note = (text) => '<div class="note">' + text + '</div>';
  const field = (label, id, options, current) =>
    '<label class="field" for="' +
    id +
    '">' +
    label +
    '<select id="' +
    id +
    '" data-field="' +
    id +
    '">' +
    options
      .map(
        ([v, l]) =>
          '<option value="' +
          v +
          '"' +
          (current === v ? ' selected' : '') +
          '>' +
          l +
          '</option>',
      )
      .join('') +
    '</select></label>';
  const shortcut = (label, route, ico, sub = '') =>
    link(
      icon(ico) +
        '<span><strong>' +
        label +
        '</strong>' +
        (sub ? '<small>' + sub + '</small>' : '') +
        '</span>' +
        icon('arrow'),
      route,
      'shortcut',
    );
  const mini = (title, meta, route, ico = 'calendar') =>
    link(
      '<span class="mini-icon">' +
        icon(ico) +
        '</span><span><strong>' +
        title +
        '</strong><small>' +
        meta +
        '</small></span>' +
        icon('arrow'),
      route,
      'list-row',
    );
  const selection = () =>
    state.reservations.find((r) => r.id === state.selected);
  const activityKey = () => state.activity + ':' + state.participant;
  const isEnrolled = () => state.enrolled.has(activityKey());
  function matchCard(m) {
    return link(
      '<div class="match-top"><span>' +
        m.sport +
        ' · Primera</span>' +
        badge(m.side) +
        '</div><div class="teams"><strong>Pucará</strong><span>vs.</span><strong>' +
        m.rival +
        '</strong></div><div class="match-date">' +
        day(m.date) +
        ' <b>' +
        m.time +
        '</b>' +
        icon('arrow') +
        '</div>',
      'match:' + m.id,
      'match-card',
    );
  }
  function personalEvents() {
    const events = state.reservations
      .filter((r) => r.status === 'confirmed')
      .map((r) => ({
        date: r.date,
        time: r.slot.split('–')[0],
        title: kindName(r.kind),
        meta: 'Reserva confirmada · Alex',
        route: 'reservation:' + r.id,
      }));
    for (const key of state.enrolled) {
      const [a, p] = key.split(':');
      for (const date of activityDates[a])
        events.push({
          date,
          time: activities[a].time,
          title: activities[a].name,
          meta: people[p] + ' · inscripción recurrente',
          route: 'activity:' + a + ':' + p,
          participant: p,
        });
    }
    if (state.persona === 'athlete')
      events.push(
        {
          date: '2026-11-05',
          time: '19:30',
          title: 'Entrenamiento de rugby',
          meta: 'Equipo de ejemplo · Cancha 2',
          route: 'scheduled:training',
        },
        {
          date: '2026-11-07',
          time: '14:30',
          title: 'Convocatoria · Rugby',
          meta: 'Horario de presentación · ejemplo',
          route: 'scheduled:call',
        },
        {
          date: '2026-11-07',
          time: '15:30',
          title: 'Partido de rugby',
          meta: 'Equipo de ejemplo · Local',
          route: 'match:rugby',
        },
      );
    return events.sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time),
    );
  }
  function home() {
    const quick =
      '<div class="quick-actions">' +
      shortcut('Reservas', 'reservations', 'racket') +
      shortcut('Gimnasio', 'gym', 'gym') +
      shortcut('Cuenta corriente', 'account', 'money') +
      '</div>';
    const welcome = heading(
      'JUEVES 5 DE NOVIEMBRE',
      'Hola, Alex.',
      themes[theme].tagline,
    );
    const fixtures =
      sectionTitle('Primera, siempre cerca', link('Fixture', 'fixtures')) +
      '<div class="matches">' +
      matches.map(matchCard).join('') +
      '</div>';
    const next = personalEvents().slice(0, 2);
    const personal =
      sectionTitle('Para vos', link('Ver agenda', 'agenda')) +
      (next.length
        ? next
            .map((e) => mini(e.title, day(e.date) + ' · ' + e.time, e.route))
            .join('')
        : note(
            'No tenés compromisos próximos. Podés reservar un espacio o descubrir actividades.',
          ));
    const news =
      sectionTitle('Novedades y comunicaciones', link('Ver todas', 'news')) +
      '<div class="news-feature"><div class="news-art" aria-hidden="true"><span>CLUB<br>PUCARÁ</span><i></i></div><div><span class="eyebrow">VIDA EN EL CLUB · EJEMPLO</span><h3>El sábado nos encuentra juntos.</h3><p>Una jornada para compartir en familia.</p>' +
      link('Leer comunicado ' + icon('arrow'), 'news:detail') +
      '</div></div>';
    if (theme === 'b')
      return (
        '<div class="sport-hero"><span class="hero-word" aria-hidden="true">PUCARÁ</span>' +
        welcome +
        '</div>' +
        quick +
        fixtures +
        personal +
        news
      );
    if (theme === 'c')
      return (
        '<div class="friendly-welcome">' +
        welcome +
        '<div class="hello-mark" aria-hidden="true">' +
        icon('sun') +
        '</div></div>' +
        quick +
        '<div class="daily-block">' +
        personal +
        '</div>' +
        fixtures +
        news
      );
    return welcome + quick + fixtures + personal + news;
  }
  function club() {
    return (
      heading('TU LUGAR', 'El club', 'Elegí cómo querés vivirlo.') +
      sectionTitle('Reservas', link('Mis reservas', 'reservations')) +
      '<div class="booking-tiles">' +
      link(
        '<span>01</span>' +
          icon('racket') +
          '<strong>Pádel</strong><small>Encontrá tu próximo turno</small>',
        'availability:padel',
        'booking-tile',
      ) +
      link(
        '<span>02</span>' +
          icon('club') +
          '<strong>Quinchos</strong><small>Un lugar para encontrarse</small>',
        'availability:quincho',
        'booking-tile',
      ) +
      '</div>' +
      sectionTitle('Deportes') +
      '<div class="sport-links">' +
      mini('Rugby', 'Fixture, resultados y videos', 'sport:rugby', 'ball') +
      mini('Hockey', 'Fixture, resultados y videos', 'sport:hockey', 'ball') +
      mini('Gimnasio', 'Tu rutina, a tu tiempo', 'gym', 'gym') +
      '</div>' +
      '<div class="split-heading">' +
      sectionTitle('Actividades') +
      '<span class="muted">Encontrá tu ritmo</span></div><div class="activity-tiles">' +
      activityTile('yoga') +
      activityTile('funcional') +
      '</div>' +
      sectionTitle('Vida en el club') +
      mini('Buffet y beneficios', 'Servicios para disfrutar', 'life', 'club') +
      mini(
        'Novedades y eventos',
        'Todo lo que está pasando',
        'news',
        'calendar',
      )
    );
  }
  function activityTile(id) {
    const a = activities[id];
    return link(
      icon(a.icon) +
        '<strong>' +
        a.name +
        '</strong><small>' +
        a.schedule.split(' · ')[0] +
        '</small>' +
        icon('arrow'),
      'activity:' + id,
      'activity-tile',
    );
  }
  function reservationRow(r) {
    return link(
      '<span class="mini-icon">' +
        icon(r.kind === 'padel' ? 'racket' : 'club') +
        '</span><span><strong>' +
        kindName(r.kind) +
        '</strong><small>' +
        day(r.date) +
        ' · ' +
        r.slot +
        '</small>' +
        badge(statusName(r.status), r.status === 'confirmed' ? 'success' : '') +
        '</span>' +
        icon('arrow'),
      'reservation:' + r.id,
      'list-row reservation-row',
    );
  }
  function reservations() {
    const active = state.reservations.filter(
      (r) => !['cancelled', 'rejected'].includes(r.status),
    );
    const historic = state.reservations.filter((r) =>
      ['cancelled', 'rejected'].includes(r.status),
    );
    return (
      heading(
        'ESPACIOS PARA COMPARTIR',
        'Reservas',
        'Un turno en la cancha. Un encuentro en el club.',
      ) +
      '<div class="booking-tiles">' +
      link(
        icon('racket') +
          '<strong>Pádel</strong><small>Consultar turnos</small>',
        'availability:padel',
        'booking-tile',
      ) +
      link(
        icon('club') +
          '<strong>Quinchos</strong><small>Elegir fecha y horario</small>',
        'availability:quincho',
        'booking-tile',
      ) +
      '</div>' +
      sectionTitle('Mis reservas', badge(active.length + ' activas')) +
      (active.length
        ? active.map(reservationRow).join('')
        : note('Todavía no tenés reservas activas.')) +
      (historic.length
        ? sectionTitle('Historial') + historic.map(reservationRow).join('')
        : '')
    );
  }
  function availability() {
    const slots =
      state.kind === 'padel'
        ? ['16:30–18:00', '18:00–19:30', '19:30–21:00']
        : ['12:00–16:00', '17:00–21:00'];
    const empty = state.date === '2026-11-08';
    return (
      heading(
        state.editing ? 'MODIFICAR RESERVA' : 'CONSULTAR DISPONIBILIDAD',
        state.kind === 'padel'
          ? 'Jugamos al pádel.'
          : 'Nos vemos en el quincho.',
        kindName(state.kind),
      ) +
      '<div class="progress"><b>1 · Elegir</b><span>2 · Revisar</span><span>3 · Resolver</span></div>' +
      field(
        'Fecha',
        'booking-date',
        [
          ['2026-11-06', 'Viernes 6 de noviembre'],
          ['2026-11-07', 'Sábado 7 de noviembre'],
          ['2026-11-08', 'Domingo 8 · sin disponibilidad de ejemplo'],
        ],
        state.date,
      ) +
      sectionTitle('Horarios disponibles') +
      (empty
        ? '<div class="empty"><h2>Ese día está completo.</h2><p>Probá otra fecha. Tu consulta no realizó ninguna reserva.</p>' +
          btn('Ver viernes 6', 'another-day') +
          '</div>'
        : '<div class="slots">' +
          slots
            .map((slot) => {
              const occupied =
                state.blocked.has(state.kind + '|' + state.date + '|' + slot) ||
                state.reservations.some(
                  (r) =>
                    r.id !== state.editing &&
                    r.kind === state.kind &&
                    r.date === state.date &&
                    r.slot === slot &&
                    !['cancelled', 'rejected'].includes(r.status),
                );
              return (
                '<button type="button" class="slot' +
                (state.slot === slot ? ' selected' : '') +
                '" data-action="slot" data-value="' +
                slot +
                '" aria-pressed="' +
                (state.slot === slot) +
                '"' +
                (occupied ? ' disabled' : '') +
                '><strong>' +
                slot +
                '</strong><small>' +
                (occupied ? 'Ocupado' : 'Disponible') +
                '</small></button>'
              );
            })
            .join('') +
          '</div>') +
      '<div class="price-row"><span>' +
      (state.kind === 'padel' ? 'Precio por turno' : 'Importe de escenario') +
      '<small>Tarifa ficticia, no aprobada</small></span><strong>' +
      cost(state.kind) +
      '</strong></div>' +
      note(
        state.kind === 'padel'
          ? 'Pago por turno. En esta revisión solo se simula el resultado; no se ingresan datos bancarios.'
          : 'Las condiciones de aprobación y pago son configurables. El escenario elegido se muestra antes de confirmar.',
      ) +
      '<button type="button" class="primary" data-action="booking-review"' +
      (!state.slot ? ' disabled' : '') +
      '>Revisar ' +
      (state.editing ? 'cambio' : 'reserva') +
      icon('arrow') +
      '</button>'
    );
  }
  function bookingSummary() {
    return (
      '<div class="summary-card"><span class="eyebrow">' +
      (state.kind === 'padel' ? 'PÁDEL' : 'QUINCHOS') +
      '</span><h2>' +
      kindName(state.kind) +
      '</h2><dl><div><dt>Fecha</dt><dd>' +
      day(state.date) +
      '</dd></div><div><dt>Horario</dt><dd>' +
      state.slot +
      '</dd></div><div><dt>Titular</dt><dd>Alex Modelo · ficticio</dd></div><div><dt>Importe</dt><dd>' +
      cost(state.kind) +
      ' · ejemplo</dd></div></dl></div>'
    );
  }
  function bookingReview() {
    const original = state.reservations.find((r) => r.id === state.editing);
    const reviewText =
      state.kind === 'quincho'
        ? 'Aprobación: ' +
          (state.approval ? 'revisión administrativa' : 'directa') +
          '. Pago: ' +
          (state.quinchoPay
            ? 'requerido después de aprobar'
            : 'no requerido en este escenario') +
          '.'
        : 'Pago por turno. El precio incluye el turno completo del ejemplo.';
    return (
      heading(
        'REVISÁ LOS DATOS',
        state.editing ? 'Tu nuevo horario.' : 'Todo listo para revisar.',
      ) +
      '<div class="progress"><span>1 · Elegir</span><b>2 · Revisar</b><span>3 · Resolver</span></div>' +
      bookingSummary() +
      (original
        ? note(
            '<strong>Reserva original conservada</strong>' +
              day(original.date) +
              ' · ' +
              original.slot +
              '<br>El ejemplo mantiene el importe. Diferencias, cargos y reintegros deberán definirse antes del servicio real.',
          )
        : note(reviewText)) +
      '<div class="policy"><h3>Antes de continuar</h3><p>Anticipación, cambios, cancelación y devoluciones: reglas pendientes del club. Este ejemplo no fija condiciones reales.</p></div>' +
      btn(
        state.editing
          ? 'Confirmar cambio simulado'
          : state.kind === 'padel'
            ? 'Ver paso de pago'
            : state.approval
              ? 'Enviar solicitud simulada'
              : state.quinchoPay
                ? 'Ver paso de pago'
                : 'Confirmar reserva simulada',
        state.editing
          ? 'save-edit'
          : state.kind === 'padel' || (!state.approval && state.quinchoPay)
            ? 'payment'
            : 'save-booking',
      ) +
      btn('Probar conflicto de disponibilidad', 'conflict', '', 'secondary')
    );
  }
  function payment() {
    const r = selection();
    return (
      heading(
        'SIMULACIÓN DE PAGO',
        'Tu turno, en un paso.',
        'No se procesa ningún cobro.',
      ) +
      (r && state.route === 'pay-existing'
        ? '<div class="summary-card"><h2>' +
          kindName(r.kind) +
          '</h2><p>' +
          day(r.date) +
          ' · ' +
          r.slot +
          '</p><strong>' +
          cost(r.kind) +
          ' · ejemplo</strong></div>'
        : bookingSummary()) +
      note(
        'No ingreses datos de tarjeta. Estos controles permiten revisar aprobación, rechazo y recuperación del flujo.',
      ) +
      btn('Simular pago aprobado', 'pay-success') +
      btn('Simular pago rechazado', 'pay-fail', '', 'secondary') +
      '<p class="fine">La confirmación real requerirá proveedor, disponibilidad e idempotencia en servidor. No implementados.</p>'
    );
  }
  function reservationDetail() {
    const r = selection();
    if (!r) return reservations();
    const active = !['cancelled', 'rejected'].includes(r.status);
    return (
      heading('MIS RESERVAS', kindName(r.kind), day(r.date) + ' · ' + r.slot) +
      badge(
        statusName(r.status),
        r.status === 'confirmed' ? 'success' : 'warning',
      ) +
      '<div class="summary-card"><dl><div><dt>Titular</dt><dd>Alex Modelo</dd></div><div><dt>Referencia demo</dt><dd>PD-' +
      String(r.id).padStart(3, '0') +
      '</dd></div><div><dt>Pago</dt><dd>' +
      (r.paid
        ? 'Aprobado · simulación'
        : r.paymentRequired
          ? 'Requerido, sin pagar'
          : 'No requerido en este ejemplo') +
      '</dd></div></dl></div>' +
      (r.status === 'confirmed'
        ? note('Incluida en tu Agenda personal de ejemplo.')
        : r.status === 'pending'
          ? note(
              'Solicitud en revisión. Todavía no es una reserva confirmada y no aparece como tal en Agenda.',
            )
          : r.status === 'payment'
            ? note(
                'Aprobación recibida en el escenario. Falta resolver el pago de ejemplo; todavía no figura como confirmada en Agenda.',
              )
            : note(
                'Se conserva en tu historial. No figura entre tus compromisos futuros. No se ejecutó ningún reintegro.',
              )) +
      (r.status === 'payment'
        ? btn('Ver paso de pago', 'go', 'pay-existing')
        : '') +
      (active
        ? btn('Modificar fecha u horario', 'edit', String(r.id), 'secondary') +
          btn(
            'Cancelar ' + (r.status === 'pending' ? 'solicitud' : 'reserva'),
            'cancel-open',
            String(r.id),
            'danger-button',
          )
        : '') +
      link('Volver a Mis reservas', 'reservations', 'secondary') +
      (r.status === 'pending'
        ? '<aside class="scenario-inline"><strong>Solo para el revisor</strong><p>Simular respuesta administrativa; estas acciones no pertenecen al socio.</p>' +
          btn('Simular aprobación', 'approve', String(r.id), 'secondary') +
          btn('Simular rechazo', 'reject', String(r.id), 'text-button') +
          '</aside>'
        : '')
    );
  }
  function cancelReservation() {
    const r = selection();
    return (
      heading(
        'CONFIRMACIÓN',
        '¿Cancelar esta reserva?',
        'Revisá el turno antes de continuar.',
      ) +
      '<div class="summary-card"><h2>' +
      kindName(r.kind) +
      '</h2><p>' +
      day(r.date) +
      ' · ' +
      r.slot +
      '</p><p>Titular: Alex Modelo</p></div>' +
      note(
        'El turno se quitará de tu Agenda personal de ejemplo y se conservará en el historial. Un eventual reintegro o cargo depende de la política aún no definida.',
      ) +
      btn(
        'Sí, cancelar en la simulación',
        'cancel-confirm',
        '',
        'danger-button',
      ) +
      link('Conservar reserva', 'reservation:' + r.id, 'secondary')
    );
  }
  function activity() {
    const a = activities[state.activity];
    return (
      '<div class="activity-hero">' +
      icon(a.icon) +
      heading('ACTIVIDADES', a.name, a.desc) +
      '</div>' +
      field(
        'Participante',
        'participant',
        Object.entries(people),
        state.participant,
      ) +
      (state.participant === 'luca'
        ? note(
            'Vínculo de responsable ya autorizado en este escenario ficticio. No se verifica parentesco en el prototipo.',
          )
        : '') +
      '<div class="summary-card"><dl><div><dt>Días y horarios</dt><dd>' +
      a.schedule +
      '</dd></div><div><dt>Ubicación</dt><dd>' +
      a.place +
      '</dd></div><div><dt>Cupos de ejemplo</dt><dd>' +
      (isEnrolled()
        ? 'Tu lugar está asignado'
        : state.full
          ? 'Sin cupos'
          : '4 lugares disponibles') +
      '</dd></div></dl></div>' +
      (isEnrolled()
        ? badge('Inscripción activa · ' + people[state.participant], 'success')
        : '') +
      note(
        'Inscripción recurrente a la actividad. No confirma asistencia a cada clase; el registro de asistencia se definirá por separado.',
      ) +
      (isEnrolled()
        ? btn('Cancelar inscripción', 'unsubscribe-open', '', 'danger-button') +
          btn('Ver mis clases en Agenda', 'activity-agenda', '', 'secondary')
        : state.full
          ? '<div class="empty"><h2>El grupo está completo.</h2><p>No se generó una inscripción. Lista de espera y reglas de cupos se definirán en otra etapa.</p></div>'
          : btn('Inscribirme', 'enroll-review')) +
      sectionTitle('Próximas clases') +
      activityDates[state.activity]
        .slice(0, 2)
        .map(
          (date) =>
            '<div class="plain-row"><strong>' +
            day(date) +
            '</strong><span>' +
            a.time +
            ' · ' +
            a.place +
            '</span></div>',
        )
        .join('') +
      '<p class="fine">Días, horarios, sede y cupos son ficticios. Cancelaciones individuales y listas de espera quedan pendientes.</p>'
    );
  }
  function enrollmentReview(cancel = false) {
    const a = activities[state.activity];
    return (
      heading(
        cancel ? 'CANCELAR INSCRIPCIÓN' : 'INSCRIPCIÓN RECURRENTE',
        cancel ? '¿Dejar esta actividad?' : 'Tu lugar en ' + a.name + '.',
        people[state.participant],
      ) +
      '<div class="summary-card"><h2>' +
      a.name +
      '</h2><p>' +
      a.schedule +
      '<br>' +
      a.place +
      '</p></div>' +
      '<p>' +
      (cancel
        ? 'Se retirarán estas clases futuras de la Agenda de este participante. No se borra la actividad ni su historial anterior.'
        : 'Estas clases futuras se incorporarán a la Agenda del participante. No se registra asistencia individual.') +
      '</p>' +
      '<ul class="date-list">' +
      activityDates[state.activity]
        .map((date) => '<li>' + day(date) + ' · ' + a.time + '</li>')
        .join('') +
      '</ul>' +
      btn(
        cancel ? 'Confirmar baja simulada' : 'Confirmar inscripción simulada',
        cancel ? 'unsubscribe-confirm' : 'enroll-save',
        '',
        cancel ? 'danger-button' : 'primary',
      ) +
      link(
        cancel ? 'Mantener inscripción' : 'Volver al detalle',
        'activity:' + state.activity,
        'secondary',
      )
    );
  }
  function agenda() {
    let events = personalEvents();
    if (state.publicMatches)
      events = events.concat(
        matches
          .filter(
            (m) =>
              !events.some(
                (e) => e.route === 'match:' + m.id && e.date === m.date,
              ),
          )
          .map((m) => ({
            date: m.date,
            time: m.time,
            title: m.sport + ' · Primera',
            meta: 'Pucará vs. ' + m.rival + ' · ' + m.side + ' · público',
            route: 'match:' + m.id,
          })),
      );
    events.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    events = events.filter((e) =>
      state.agendaView === 'day'
        ? e.date === state.agendaDate
        : state.agendaView === 'week'
          ? e.date >= state.agendaWeek && e.date <= addDays(state.agendaWeek, 6)
          : true,
    );
    const dates = Array.from({ length: 7 }, (_, i) =>
      addDays(state.agendaWeek, i),
    );
    return (
      heading(
        'TU TIEMPO EN EL CLUB',
        'Agenda',
        'Compromisos y clases, en su lugar.',
      ) +
      '<div class="segmented" aria-label="Vista de calendario">' +
      [
        ['day', 'Día'],
        ['week', 'Semana'],
        ['month', 'Mes'],
      ]
        .map(
          ([v, l]) =>
            '<button type="button" data-action="agenda-view" data-value="' +
            v +
            '" aria-pressed="' +
            (state.agendaView === v) +
            '">' +
            l +
            '</button>',
        )
        .join('') +
      '</div>' +
      (state.agendaView === 'day'
        ? field(
            'Día',
            'agenda-date',
            Array.from({ length: 19 }, (_, i) => {
              const d = addDays('2026-11-02', i);
              return [d, day(d)];
            }),
            state.agendaDate,
          )
        : state.agendaView === 'week'
          ? '<div class="week-heading">' +
            btn(
              '<span class="sr-only">Semana anterior</span>←',
              'week-prev',
              '',
              'icon-button',
            ) +
            '<strong>' +
            day(state.agendaWeek) +
            ' – ' +
            day(addDays(state.agendaWeek, 6)) +
            '</strong>' +
            btn(
              '<span class="sr-only">Semana siguiente</span>→',
              'week-next',
              '',
              'icon-button',
            ) +
            '</div><div class="week-strip">' +
            dates
              .map((d) =>
                btn(
                  '<small>' +
                    day(d).split(',')[0].slice(0, 3) +
                    '</small><strong>' +
                    Number(d.slice(-2)) +
                    '</strong>',
                  'agenda-day',
                  d,
                  'day-chip',
                ),
              )
              .join('') +
            '</div>'
          : '<div class="month-label">Noviembre 2026 · vista mensual secundaria</div><div class="month-grid">' +
            ['L', 'M', 'M', 'J', 'V', 'S', 'D']
              .map((d) => '<small>' + d + '</small>')
              .join('') +
            '<span style="grid-column:span 6" aria-hidden="true"></span>' +
            Array.from({ length: 30 }, (_, i) =>
              btn(
                String(i + 1),
                'agenda-day',
                '2026-11-' + String(i + 1).padStart(2, '0'),
                'day-chip',
              ),
            ).join('') +
            '</div>') +
      '<label class="check-field"><input type="checkbox" data-field="public-matches"' +
      (state.publicMatches ? ' checked' : '') +
      '> Incluir partidos del club</label>' +
      (events.length
        ? events
            .map((e) =>
              mini(
                e.title,
                day(e.date) + ' · ' + e.time + ' · ' + e.meta,
                e.route,
              ),
            )
            .join('')
        : '<div class="empty"><h2>Un poco de tiempo libre.</h2><p>No tenés compromisos en este período.</p>' +
          link('Explorar actividades', 'club') +
          '</div>') +
      '<p class="fine">Gimnasio libre no genera eventos. Las clases aparecen solo por inscripción activa. Las solicitudes pendientes no se muestran como reservas confirmadas.</p>'
    );
  }
  function match() {
    const m = matches.find((item) => item.id === state.route.split(':')[1]);
    return (
      heading(
        m.sport.toUpperCase() + ' · PRIMERA',
        'Nos vemos en la cancha.',
        badge(m.side),
      ) +
      '<div class="match-detail"><span class="team-monogram">P</span><h2>Pucará <span>vs.</span> ' +
      m.rival +
      '</h2><p>' +
      day(m.date) +
      ' · ' +
      m.time +
      '</p></div>' +
      mini('Sede del encuentro', m.place, 'fixtures', 'pin') +
      note(
        'Fixture ficticio para revisar la experiencia. No implica convocatoria ni compromiso personal.',
      ) +
      link('Ver fixture de ' + m.sport, 'sport:' + m.id, 'primary') +
      link('Ver resultados', 'results:' + m.id, 'secondary')
    );
  }
  function fixtures(results = false, sport = null) {
    return (
      heading(
        'DEPORTES',
        results ? 'Resultados' : 'Fixture',
        'Primera · temporada de ejemplo',
      ) +
      (results
        ? note(
            'Todavía no hay resultados publicados en este escenario. No se inventan marcadores.',
          )
        : matches
            .filter((m) => !sport || m.id === sport)
            .map(matchCard)
            .join('')) +
      link('Volver al Club', 'club', 'secondary')
    );
  }
  function secondaryPage() {
    if (state.route.startsWith('scheduled:'))
      return (
        heading(
          'COMPROMISO PERSONAL',
          state.route.endsWith('training')
            ? 'Entrenamiento de rugby'
            : 'Convocatoria de rugby',
          'Horario establecido · escenario de deportista',
        ) +
        note(
          state.route.endsWith('training')
            ? 'Jueves 5 · 19:30–21:00 · Cancha 2'
            : 'Sábado 7 · presentación 14:30 · Cancha principal',
        ) +
        link('Ver agenda', 'agenda', 'secondary')
      );
    if (state.route === 'gym')
      return (
        heading(
          'GIMNASIO',
          'A tu tiempo.',
          'Tu rutina no ocupa un horario en Agenda.',
        ) +
        note(
          'Acceso contextual. El registro de entrenamiento no se desarrolla en esta revisión.',
        ) +
        mini('Rutina semanal', 'Ejemplo · fuerza y movilidad', 'gym', 'gym')
      );
    if (state.route === 'account')
      return (
        heading('TU INFORMACIÓN', 'Cuenta') +
        badge('Socio activo · demo', 'success') +
        '<div class="account-feature"><span class="eyebrow">CUENTA CORRIENTE</span><h2>Al día</h2><p>Beca 100 % · saldo ficticio $0</p></div>' +
        note('Estado administrativo y situación económica independientes.') +
        ['Grupo familiar', 'Perfil', 'Preferencias', 'Soporte']
          .map(
            (t) =>
              '<div class="plain-row"><strong>' +
              t +
              '</strong><span>Fuera del recorrido de esta revisión</span></div>',
          )
          .join('')
      );
    if (state.route === 'card')
      return (
        heading('IDENTIFICACIÓN', 'Tu carnet') +
        '<div class="member-card"><span>PUCARÁ DIGITAL</span><h2>Alex Modelo</h2><p>Socio ficticio · 0000</p><div class="qr-placeholder">ÁREA QR DEMO<br><small>Sin código de acceso válido</small></div><strong>NO VÁLIDO PARA INGRESAR</strong></div>'
      );
    if (state.route.startsWith('sport:')) {
      const id = state.route.split(':')[1];
      return (
        heading(
          'DEPORTES',
          id === 'rugby' ? 'Rugby' : 'Hockey',
          'Primera y vida del equipo',
        ) +
        matchCard(matches.find((m) => m.id === id)) +
        link('Fixture', 'fixtures:' + id, 'secondary') +
        link('Resultados', 'results:' + id, 'secondary') +
        link('Videos', 'videos:' + id, 'secondary')
      );
    }
    if (state.route.startsWith('videos:'))
      return (
        heading('DEPORTES', 'Videos') +
        note(
          'Sin videos publicados en el escenario. Carga de contenidos y permisos pendientes; no hay reproducción externa.',
        )
      );
    if (state.route === 'news:detail')
      return (
        heading(
          'COMUNICACIÓN DEL CLUB',
          'El sábado nos encuentra juntos.',
          'Contenido ficticio · publicado por administración',
        ) +
        '<p>Una jornada de encuentro para compartir en familia. Este ejemplo permite revisar lectura y jerarquía de la comunicación.</p>' +
        note(
          'En el producto, este contenido será administrable desde el panel web. No hay publicación real en el prototipo.',
        )
      );
    if (state.route === 'news')
      return (
        heading(
          'VIDA EN EL CLUB',
          'Novedades y comunicaciones',
          'Contenido publicado desde administración en la futura aplicación.',
        ) +
        mini(
          'El sábado nos encuentra juntos',
          'Comunicado ficticio',
          'news:detail',
          'club',
        ) +
        mini(
          'Agenda del fin de semana',
          'Evento ficticio',
          'fixtures',
          'calendar',
        )
      );
    return (
      heading('VIDA EN EL CLUB', 'Para disfrutar') +
      note(
        'Buffet, beneficios y eventos: accesos contextuales de arquitectura. Su contenido se desarrolla en otra etapa.',
      )
    );
  }
  function render() {
    const focused = document.activeElement;
    const focusId = focused?.id;
    const focusHeading = focused?.matches('#screen h1');
    const focusAction = focused?.dataset?.action;
    const focusValue = focused?.dataset?.value;
    const routes = {
      home,
      club,
      reservations,
      availability,
      'booking-review': bookingReview,
      payment,
      'pay-existing': payment,
      reservation: reservationDetail,
      'cancel-reservation': cancelReservation,
      activity,
      'enroll-review': () => enrollmentReview(false),
      'unsubscribe-review': () => enrollmentReview(true),
      agenda,
      match,
    };
    const key = state.route.split(':')[0];
    let content =
      key === 'fixtures' || key === 'results'
        ? fixtures(key === 'results', state.route.split(':')[1])
        : (routes[key] || secondaryPage)();
    document.querySelector('#screen').innerHTML =
      (state.route !== 'home' &&
      state.route !== 'club' &&
      state.route !== 'agenda' &&
      state.route !== 'card' &&
      state.route !== 'account'
        ? btn(icon('back') + 'Volver', 'back', '', 'back-button')
        : '') +
      (state.flash
        ? '<div class="feedback ' +
          state.flashType +
          '" role="status">' +
          esc(state.flash) +
          '</div>'
        : '') +
      content;
    const dock = document.querySelector('#action-dock');
    dock.replaceChildren();
    const dockRoutes = [
      'availability',
      'booking-review',
      'payment',
      'pay-existing',
      'activity',
      'enroll-review',
    ];
    const primary = document.querySelector('#screen > .primary');
    dock.hidden = !(dockRoutes.includes(key) && primary);
    if (!dock.hidden) dock.append(primary);
    const tabs = [
      ['home', 'Inicio', 'home'],
      ['agenda', 'Agenda', 'calendar'],
      ['card', 'Carnet', 'card'],
      ['club', 'Club', 'club'],
      ['account', 'Cuenta', 'user'],
    ];
    document.querySelector('#tabs').innerHTML = tabs
      .map(
        ([r, label, i]) =>
          '<button type="button" data-action="tab" data-value="' +
          r +
          '"' +
          (state.activeTab === r ? ' aria-current="page"' : '') +
          '>' +
          icon(i) +
          '<span>' +
          label +
          '</span></button>',
      )
      .join('');
    document.querySelector('#review-route').textContent = state.route;
    if (focusId && document.getElementById(focusId))
      document.getElementById(focusId).focus({ preventScroll: true });
    else if (focusHeading)
      document.querySelector('#screen h1')?.focus({ preventScroll: true });
    else if (focusAction) {
      const target = [...document.querySelectorAll('[data-action]')].find(
        (node) =>
          node.dataset.action === focusAction &&
          node.dataset.value === focusValue,
      );
      target?.focus({ preventScroll: true });
    }
  }
  function go(route, remember = true) {
    if (remember && route !== state.route) state.trail.push(state.route);
    state.route = route;
    state.flash = '';
    state.flashType = 'info';
    if (route.startsWith('activity:')) {
      state.activity = route.split(':')[1];
      if (route.split(':')[2]) state.participant = route.split(':')[2];
    }
    if (route.startsWith('reservation:'))
      state.selected = Number(route.split(':')[1]);
    if (route.startsWith('availability:')) {
      state.kind = route.split(':')[1];
      state.route = 'availability';
      state.editing = null;
      state.selected = null;
      state.slot = '';
      state.date = '2026-11-06';
    }
    if (['home', 'club', 'agenda', 'card', 'account'].includes(route))
      state.activeTab = route;
    render();
    document.querySelector('#screen').scrollTop = 0;
    document.querySelector('#screen h1')?.focus({ preventScroll: true });
  }
  function finish(message, route, type = 'success') {
    go(route);
    state.flash = message;
    state.flashType = type;
    render();
  }
  function saveBooking(paid) {
    const pending = state.kind === 'quincho' && state.approval && !paid;
    const r = {
      id: Math.max(...state.reservations.map((r) => r.id)) + 1,
      kind: state.kind,
      date: state.date,
      slot: state.slot,
      status: pending ? 'pending' : 'confirmed',
      paid,
      paymentRequired: state.kind === 'padel' || state.quinchoPay,
    };
    state.reservations.push(r);
    state.selected = r.id;
    state.slot = '';
    state.trail = ['reservations'];
    finish(
      pending
        ? 'Solicitud de ejemplo enviada. Espera aprobación.'
        : 'Reserva confirmada solo en esta simulación.',
      'reservation:' + r.id,
    );
  }
  function validSelection() {
    return (
      state.slot &&
      state.date !== '2026-11-08' &&
      !state.blocked.has(state.kind + '|' + state.date + '|' + state.slot) &&
      !state.reservations.some(
        (r) =>
          r.id !== state.editing &&
          r.kind === state.kind &&
          r.date === state.date &&
          r.slot === state.slot &&
          !['cancelled', 'rejected'].includes(r.status),
      )
    );
  }
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action,
      value = target.dataset.value;
    if (action === 'go' || action === 'tab') {
      if (action === 'tab') state.trail = [];
      go(value);
      return;
    }
    if (action === 'back') {
      go(state.trail.pop() || 'home', false);
      return;
    }
    if (action === 'reset') {
      reset();
      document.querySelector('[data-field=approval]').checked = true;
      for (const id of ['quincho-pay', 'full'])
        document.querySelector('[data-field=' + id + ']').checked = false;
      document.querySelector('[data-field=persona]').value = 'social';
      render();
      return;
    }
    if (action === 'slot') {
      state.slot = value;
      render();
      return;
    }
    if (action === 'another-day') {
      state.date = '2026-11-06';
      state.slot = '';
      render();
      return;
    }
    if (action === 'booking-review') {
      if (validSelection()) go('booking-review');
      return;
    }
    if (action === 'payment') {
      go('payment');
      return;
    }
    if (action === 'save-booking') {
      if (validSelection()) saveBooking(false);
      return;
    }
    if (action === 'pay-fail') {
      state.flashType = 'error';
      state.flash =
        'Pago rechazado en el escenario. No se confirmó la reserva ni se realizó un cobro. Podés reintentar.';
      render();
      return;
    }
    if (action === 'pay-success') {
      if (state.route === 'pay-existing') {
        const r = selection();
        r.paid = true;
        r.status = 'confirmed';
        finish(
          'Pago y confirmación simulados. Sin cobro real.',
          'reservation:' + r.id,
        );
      } else if (validSelection()) saveBooking(true);
      return;
    }
    if (action === 'conflict') {
      state.blocked.add(state.kind + '|' + state.date + '|' + state.slot);
      go('availability');
      state.slot = '';
      state.flash =
        'El turno dejó de estar disponible en este escenario. Elegí otra opción. No se cobró ni se modificó tu reserva anterior.';
      render();
      return;
    }
    if (action === 'edit') {
      const r = state.reservations.find((r) => r.id === Number(value));
      state.editing = r.id;
      state.kind = r.kind;
      state.date = r.date;
      state.slot = '';
      go('availability');
      return;
    }
    if (action === 'save-edit') {
      if (!validSelection()) return;
      const r = state.reservations.find((r) => r.id === state.editing);
      r.date = state.date;
      r.slot = state.slot;
      state.editing = null;
      finish(
        'Cambio guardado solo en la simulación. El estado de pago se conserva.',
        'reservation:' + r.id,
      );
      return;
    }
    if (action === 'cancel-open') {
      state.selected = Number(value);
      go('cancel-reservation');
      return;
    }
    if (action === 'cancel-confirm') {
      const r = selection();
      r.status = 'cancelled';
      finish(
        'Cancelada en la simulación. Sin reintegro real.',
        'reservation:' + r.id,
      );
      return;
    }
    if (action === 'approve') {
      const r = selection();
      r.status = r.paymentRequired ? 'payment' : 'confirmed';
      finish('Respuesta administrativa simulada.', 'reservation:' + r.id);
      return;
    }
    if (action === 'reject') {
      const r = selection();
      r.status = 'rejected';
      finish(
        'Solicitud rechazada en este escenario; no se cobró.',
        'reservation:' + r.id,
      );
      return;
    }
    if (action === 'enroll-review') {
      if (!state.full && !isEnrolled()) go('enroll-review');
      return;
    }
    if (action === 'enroll-save') {
      if (state.full) {
        state.flashType = 'error';
        state.flash = 'El cupo se completó. No se confirmó una inscripción.';
        render();
        return;
      }
      state.enrolled.add(activityKey());
      finish(
        'Inscripción simulada. Las próximas clases ya aparecen en la Agenda del participante.',
        'activity:' + state.activity,
      );
      return;
    }
    if (action === 'unsubscribe-open') {
      go('unsubscribe-review');
      return;
    }
    if (action === 'unsubscribe-confirm') {
      state.enrolled.delete(activityKey());
      finish(
        'Baja simulada. Se retiraron las clases futuras de este participante.',
        'activity:' + state.activity,
      );
      return;
    }
    if (action === 'activity-agenda') {
      state.agendaWeek = '2026-11-09';
      state.agendaDate = activityDates[state.activity][0];
      state.agendaView = 'week';
      go('agenda');
      return;
    }
    if (action === 'agenda-view') {
      state.agendaView = value;
      render();
      return;
    }
    if (action === 'agenda-day') {
      state.agendaView = 'day';
      state.agendaDate = value;
      render();
      return;
    }
    if (action === 'week-next' || action === 'week-prev') {
      state.agendaWeek = addDays(
        state.agendaWeek,
        action === 'week-next' ? 7 : -7,
      );
      render();
    }
  });
  document.addEventListener('change', (event) => {
    const id = event.target.dataset.field;
    if (!id) return;
    if (id === 'booking-date') {
      state.date = event.target.value;
      state.slot = '';
    }
    if (id === 'participant') state.participant = event.target.value;
    if (id === 'agenda-date') state.agendaDate = event.target.value;
    if (id === 'public-matches') state.publicMatches = event.target.checked;
    if (id === 'approval') state.approval = event.target.checked;
    if (id === 'quincho-pay') state.quinchoPay = event.target.checked;
    if (id === 'full') state.full = event.target.checked;
    if (id === 'persona') {
      state.persona = event.target.value;
      state.participant = state.persona === 'family' ? 'luca' : 'alex';
    }
    render();
  });
  document.querySelector('#concept-name').textContent = themes[theme].name;
  document.querySelector('#concept-intro').textContent = themes[theme].intro;
  if (new URLSearchParams(location.search).get('embed') === '1')
    document.body.classList.add('embedded');
  window.addEventListener('message', (event) => {
    if (
      event.source !== window.parent ||
      event.data?.type !== 'pucara-review-screen'
    )
      return;
    if (
      ['home', 'club', 'reservations', 'activity:yoga'].includes(
        event.data.route,
      )
    )
      go(event.data.route);
  });
  render();
})();
