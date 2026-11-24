import { visibleScholarships } from '@pucara/shared';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type {
  MemberExperience,
  FamilyMember,
  FamilyScope,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  Label,
  layout,
  Pill,
  Tap,
} from '../../components/handoff-ui';
import { Avatar, DemoCaption } from '../experience/identity-ui';
import {
  accountHref,
  AccountRow,
  Balance,
  FamilyList,
  Ledger,
  ProfileLine,
  Scholarships,
  type AccountSection,
} from './account-ui';
import { Preferences } from './preferences';
export function AccountHome({ data }: { data: MemberExperience }) {
  const p = data.member;
  const scholarships = visibleScholarships(data).length;
  return (
    <>
      <Label role="title">Cuenta</Label>
      <Tap label="Ver perfil" href={accountHref('perfil')} style={layout.row}>
        <ProfileLine
          person={p}
          detail={
            'Socio N° ' +
            p.number +
            ' · ' +
            p.administrativeStatus +
            ' · ' +
            p.category
          }
        />
        <Pill tone="blue">Ver perfil</Pill>
      </Tap>
      <Balance data={data} />
      <View style={layout.group}>
        <View style={layout.between}>
          <Label role="section">Grupo familiar</Label>
          <Label role="meta" ink={color.secondaryText}>
            {data.family.some((f) => f.scopes.includes('profile'))
              ? 'Sos responsable'
              : ''}
          </Label>
        </View>
        <FamilyList data={data} />
      </View>
      <View style={[layout.card, { padding: 0 }]}>
        {(
          [
            ['perfil', 'Perfil', 'person'],
            ['becas', 'Becas', 'benefits'],
            ['preferencias', 'Preferencias', 'settings'],
            ['soporte', 'Soporte', 'help'],
          ] as const
        ).map(([section, title, icon], i) => (
          <View key={section}>
            {i > 0 && <View style={layout.line} />}
            <AccountRow
              title={title}
              href={accountHref(section)}
              icon={icon}
              note={
                section === 'becas'
                  ? scholarships === 1
                    ? '1 activa'
                    : scholarships + ' activas'
                  : undefined
              }
            />
          </View>
        ))}
      </View>
      <DemoCaption>Cuenta de demostración</DemoCaption>
    </>
  );
}
const scopes: readonly [FamilyScope, string][] = [
  ['card', 'Ver carnet'],
  ['agenda', 'Ver agenda y convocatorias'],
  ['fees', 'Ver y pagar cuotas'],
  ['activities', 'Inscribir en actividades'],
  ['reservations', 'Reservar pádel o quinchos'],
];
function Relative({
  child,
  data,
}: {
  child: FamilyMember;
  data: MemberExperience;
}) {
  const router = useRouter();
  return (
    <>
      <View
        style={[layout.card, layout.group, { backgroundColor: color.navySoft }]}
      >
        <ProfileLine
          person={child}
          detail={child.category + ' · N° ' + child.number}
        />
        <View style={[layout.card, { padding: 9 }]}>
          <Label role="label">
            Estás viendo el perfil de {child.firstName} como responsable
          </Label>
        </View>
      </View>
      <View style={[layout.row, { flexWrap: 'wrap' }]}>
        {(['card', 'agenda'] as const)
          .filter((s) => child.scopes.includes(s))
          .map((s) => (
            <View key={s} style={{ flexGrow: 1 }}>
              <Command
                variant="navy"
                title={s === 'card' ? 'Ver carnet' : 'Ver agenda'}
                icon={s === 'card' ? 'person' : 'calendar'}
                onPress={() =>
                  router.navigate({
                    pathname: s === 'card' ? '/carnet' : '/agenda',
                    params: {
                      person: child.id,
                      visit: String(Date.now()),
                      receipt: '',
                      day: '',
                    },
                  })
                }
              />
            </View>
          ))}
      </View>
      <View style={layout.group}>
        <Label role="subhead">Qué podés hacer por {child.firstName}</Label>
        <View style={[layout.card, { paddingVertical: 2 }]}>
          {scopes.map(([scope, title], i) => {
            const ok = child.scopes.includes(scope);
            return (
              <View key={scope}>
                {i > 0 && <View style={layout.line} />}
                <View style={[layout.row, { minHeight: 48 }]}>
                  <AppIcon
                    name={ok ? 'check' : 'info'}
                    color={ok ? color.success : color.secondaryText}
                    size={18}
                  />
                  <Label role="meta" style={layout.grow}>
                    {title}
                  </Label>
                  {!ok && (
                    <Label role="label" ink={color.secondaryText}>
                      No habilitado
                    </Label>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <Label role="meta" ink={color.secondaryText}>
          Permisos de ejemplo. El club los define para cada vínculo.
        </Label>
      </View>
      <View style={layout.group}>
        <Label role="subhead">Responsables</Label>
        <View style={[layout.card, layout.group]}>
          <View style={layout.row}>
            <Avatar person={data.member} size={32} />
            <Label style={layout.grow}>{data.member.name}</Label>
            <Pill tone="blue">Vos</Pill>
          </View>
          {child.otherGuardians.map((name) => (
            <View key={name} style={layout.between}>
              <Label>{name}</Label>
              <Label role="meta">Responsable</Label>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
export function AccountDetail({
  section,
  data,
  id,
}: {
  section: AccountSection;
  data: MemberExperience;
  id?: string | undefined;
}) {
  switch (section) {
    case 'integrante': {
      const child = data.family.find(
        (f) => f.id === id && f.scopes.includes('profile'),
      );
      return child ? (
        <Relative data={data} child={child} />
      ) : (
        <Label>Perfil no disponible para este vínculo.</Label>
      );
    }
    case 'cuenta-corriente':
      return (
        <>
          <Ledger data={data} />
          <DemoCaption>
            Importes de ejemplo. Los pagos son demostrativos.
          </DemoCaption>
        </>
      );
    case 'familia':
      return <FamilyList data={data} />;
    case 'becas':
      return (
        <>
          <Scholarships data={data} />
          <DemoCaption />
        </>
      );
    case 'perfil':
      return (
        <>
          <ProfileLine
            person={data.member}
            detail={'Socio N° ' + data.member.number}
          />
          <View style={[layout.card, layout.group]}>
            <Label role="label">Categoría</Label>
            <Label>{data.member.category}</Label>
            <View style={layout.line} />
            <Label role="label">Membresía</Label>
            <Label>{data.member.administrativeStatus}</Label>
          </View>
          <DemoCaption>Perfil de demostración · solo lectura</DemoCaption>
        </>
      );
    case 'preferencias':
      return <Preferences />;
    case 'soporte':
      return (
        <>
          <View style={[layout.card, layout.group]}>
            <Label role="subhead">Ayuda del club</Label>
            <Label>
              Para consultar una cuota, abrí Cuenta corriente. Para revisar
              carnets o agendas vinculadas, entrá al perfil del familiar.
            </Label>
          </View>
          <View style={[layout.card, { padding: 0 }]}>
            <AccountRow
              title="Cuenta corriente"
              icon="account"
              href={accountHref('cuenta-corriente')}
            />
            <View style={layout.line} />
            <AccountRow
              title="Grupo familiar"
              icon="family"
              href={accountHref('familia')}
            />
          </View>
          <DemoCaption>
            Los canales oficiales de contacto están pendientes.
          </DemoCaption>
        </>
      );
  }
}
