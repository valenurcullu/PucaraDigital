import { visibleScholarships } from '@pucara/shared';
import { View } from 'react-native';
import type { Href } from 'expo-router';
import type { MemberExperience, MemberIdentity } from '@pucara/shared';
import { AppIcon, type AppIconName } from '../../components/app-icon';
import { color, Label, layout, Pill, Tap } from '../../components/handoff-ui';
import { Avatar } from '../experience/identity-ui';
import { formatMoney } from '../experience/navigation';
export const sectionTitles = {
  perfil: 'Perfil',
  'cuenta-corriente': 'Cuenta corriente',
  familia: 'Grupo familiar',
  integrante: 'Grupo familiar',
  becas: 'Becas',
  preferencias: 'Preferencias',
  soporte: 'Ayuda e información',
} as const;
export type AccountSection = keyof typeof sectionTitles;
export function accountHref(section: AccountSection, id?: string): Href {
  return {
    pathname: '/cuenta/[section]',
    params: id ? { section, id } : { section },
  };
}
export const monthLabel = (day: string) =>
  new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(day + 'T12:00:00Z'));
const brief = (date: string) =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));
export function ProfileLine({
  person,
  detail,
}: {
  person: MemberIdentity;
  detail: string;
}) {
  return (
    <View style={[layout.row, { flex: 1 }]}>
      <Avatar person={person} size={60} />
      <View style={layout.grow}>
        <Label role="section">{person.name}</Label>
        <Label role="meta" ink={color.secondaryText}>
          {detail}
        </Label>
      </View>
    </View>
  );
}
export function AccountRow({
  title,
  href,
  icon,
  note,
}: {
  title: string;
  href: Href;
  icon: AppIconName;
  note?: string | undefined;
}) {
  return (
    <Tap
      label={title}
      href={href}
      style={[layout.row, { minHeight: 54, paddingHorizontal: 14 }]}
    >
      <AppIcon name={icon} size={20} />
      <Label role="card" style={layout.grow}>
        {title}
      </Label>
      {note && (
        <Label role="meta" ink={color.secondaryText}>
          {note}
        </Label>
      )}
      <AppIcon name="chevron" size={15} />
    </Tap>
  );
}
export function FamilyList({ data }: { data: MemberExperience }) {
  const family = data.family.filter((f) => f.scopes.includes('profile'));
  return (
    <View style={[layout.card, { padding: 0 }]}>
      {family.length ? (
        family.map((f, i) => (
          <View key={f.id}>
            {i > 0 && <View style={layout.line} />}
            <Tap
              label={'Perfil de ' + f.firstName}
              href={accountHref('integrante', f.id)}
              style={[layout.row, { minHeight: 66, padding: 12 }]}
            >
              <Avatar person={f} />
              <View style={layout.grow}>
                <Label role="card">{f.name}</Label>
                <Label role="meta" ink={color.secondaryText}>
                  {f.category} · {f.age} años
                </Label>
              </View>
              <AppIcon name="chevron" size={15} />
            </Tap>
          </View>
        ))
      ) : (
        <Label style={{ padding: 14 }}>Sin familiares vinculados.</Label>
      )}
    </View>
  );
}
export function Balance({
  data,
  detail = false,
}: {
  data: MemberExperience;
  detail?: boolean;
}) {
  const account = data.account,
    next = account.dues.find((d) => !d.payment);
  const ink = detail ? 'white' : color.text;
  const sub = detail ? color.onDarkMuted : color.secondaryText;
  const content = (
    <>
      <View style={layout.between}>
        <Label role={detail ? 'body' : 'meta'} ink={ink}>
          {detail ? 'Saldo grupo familiar' : 'Cuenta corriente'}
        </Label>
        <Pill tone={account.amountDueMinor === 0 ? 'success' : 'warning'}>
          {account.status}
        </Pill>
      </View>
      <View style={layout.row}>
        <Label role="number" ink={ink} style={{ fontSize: detail ? 46 : 40 }}>
          {formatMoney(account.amountDueMinor)}
        </Label>
        {!detail && (
          <Label role="meta" ink={sub}>
            saldo pendiente
          </Label>
        )}
      </View>
      {!detail && <View style={layout.line} />}
      <View style={layout.between}>
        <Label role="meta" ink={sub}>
          {next
            ? 'Próxima cuota · vence ' + brief(next.dueOn)
            : 'Sin cuotas próximas'}
        </Label>
        {!detail && <Pill tone="accent">Ver movimientos ›</Pill>}
      </View>
    </>
  );
  return detail ? (
    <View style={[layout.card, layout.group, { backgroundColor: color.navy }]}>
      {content}
    </View>
  ) : (
    <Tap
      label="Ver movimientos"
      href={accountHref('cuenta-corriente')}
      style={[layout.card, layout.group]}
    >
      {content}
    </Tap>
  );
}
export function Scholarships({ data }: { data: MemberExperience }) {
  const benefits = visibleScholarships(data);
  return (
    <View style={layout.group}>
      <Label role="subhead">Becas</Label>
      {benefits.length ? (
        benefits.map(({ person: p, ...s }) => (
          <View key={s.memberId + s.name} style={[layout.card, layout.row]}>
            <Avatar person={p} />
            <View style={layout.grow}>
              <Label role="card">
                {p.firstName} · {s.name}
              </Label>
              <Label role="meta">
                {s.percentage} % sobre la cuota · vigente
              </Label>
            </View>
          </View>
        ))
      ) : (
        <Label>No hay becas vigentes.</Label>
      )}
    </View>
  );
}
export function Ledger({ data }: { data: MemberExperience }) {
  return (
    <>
      <Balance data={data} detail />
      <View style={layout.group}>
        <Label role="section">Cuotas</Label>
        <View style={[layout.card, layout.group]}>
          {data.account.dues.map((d, i) => (
            <View key={d.period}>
              {i > 0 && <View style={layout.line} />}
              <View style={[layout.row, { paddingVertical: 8 }]}>
                <View style={layout.grow}>
                  <Label role="card" style={{ textTransform: 'capitalize' }}>
                    {monthLabel(d.period)}
                  </Label>
                  <Label role="meta" ink={color.secondaryText}>
                    {d.payment
                      ? 'Pagada el ' +
                        brief(d.payment.date) +
                        ' · ' +
                        d.payment.method
                      : 'Vence ' + brief(d.dueOn)}
                  </Label>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Label role="smallNumber">{formatMoney(d.amountMinor)}</Label>
                  <Label
                    role="label"
                    ink={d.payment ? color.success : color.warning}
                  >
                    {d.payment ? 'Pagada' : 'A pagar'}
                  </Label>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
      <Scholarships data={data} />
    </>
  );
}
