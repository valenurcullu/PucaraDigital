import { useState } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  viewablePeople,
  type MemberExperience,
  type MemberIdentity,
} from '@pucara/shared';
import { memberTheme } from '@pucara/design-tokens';
import { ExperienceScreen } from '../../components/member-ui';
import { color, Label, layout, Pill } from '../../components/handoff-ui';
import { AppIcon } from '../../components/app-icon';
import { PersonPicker } from '../../features/experience/identity-ui';
import a from '../../assets/demo-cards/A.png';
import b from '../../assets/demo-cards/B.png';
import c from '../../assets/demo-cards/C.png';
const samples = { A: a, B: b, C: c };
export function MembershipCard({ person }: { person: MemberIdentity }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale > 1.35;
  return (
    <View
      style={{
        backgroundColor: color.navy,
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 8, backgroundColor: color.action }} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 210,
          height: 210,
          right: -80,
          top: 30,
          borderWidth: 21,
          borderRadius: 110,
          borderColor: 'rgba(255,255,255,.04)',
        }}
      />
      <View style={{ padding: 20, gap: 16 }}>
        <View style={[layout.row, { flexWrap: 'wrap' }]}>
          <View
            style={{
              width: 46,
              height: 46,
              backgroundColor: 'white',
              borderRadius: 23,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: color.action,
              borderWidth: 3,
            }}
          >
            <Label role="day" ink={color.action}>
              P
            </Label>
          </View>
          <View style={[layout.grow, { minWidth: 105 }]}>
            <Label
              ink="white"
              style={{
                fontFamily: memberTheme.font.bold,
                fontSize: 18,
                letterSpacing: 2.5,
              }}
            >
              CLUB PUCARÁ
            </Label>
            <Label
              role="label"
              ink={color.onDarkMuted}
              style={{ fontSize: 11 }}
            >
              CARNET DE SOCIO
            </Label>
          </View>
          <Pill tone={person.card.enabled ? 'success' : 'neutral'}>
            {person.card.enabled ? 'Habilitado' : 'Inhabilitado'}
          </Pill>
        </View>
        <View>
          <Label role="sheet" ink="white" style={{ fontSize: 24 }}>
            {person.name}
          </Label>
          <Label role="meta" ink={color.onDarkMuted}>
            {person.administrativeStatus} · {person.category}
          </Label>
        </View>
        <View
          style={{
            flexDirection: stacked ? 'column' : 'row',
            alignItems: stacked ? 'flex-start' : 'flex-end',
            gap: 16,
          }}
        >
          <Image
            source={samples[person.card.sample]}
            accessible
            accessibilityLabel={
              'QR demostrativo de ' +
              person.firstName +
              ' sin validez de ingreso'
            }
            resizeMode="contain"
            style={{
              width: 150,
              height: 150,
              backgroundColor: 'white',
              borderRadius: 16,
            }}
          />
          <View style={{ gap: 6 }}>
            <Label role="label" ink={color.onDarkMuted}>
              SOCIO N°
            </Label>
            <Label role="number" ink="white" style={{ fontSize: 34 }}>
              {person.number}
            </Label>
            <Label role="label" ink={color.onDarkMuted}>
              VENCE
            </Label>
            <Label role="smallNumber" ink="white">
              {person.card.validThrough.slice(5, 7)} /{' '}
              {person.card.validThrough.slice(0, 4)}
            </Label>
          </View>
        </View>
      </View>
    </View>
  );
}
export function CardView({
  data,
  initial,
}: {
  data: MemberExperience;
  initial?: string | undefined;
}) {
  const [selected, select] = useState(initial ?? data.member.id);
  const people = viewablePeople(data, 'card');
  const person = people.find((p) => p.id === selected);
  return (
    <>
      <Label role="title">Carnet</Label>
      <PersonPicker
        owner={data.member.id}
        people={people}
        selected={selected}
        select={select}
      />
      {person ? (
        <>
          <MembershipCard person={person} />
          <View
            style={[
              layout.card,
              layout.row,
              { backgroundColor: color.warningBackground },
            ]}
          >
            <AppIcon name="info" size={19} color={color.warning} />
            <Label role="meta" ink={color.warning} style={layout.grow}>
              QR demostrativo · todavía no habilita el ingreso.
            </Label>
          </View>
          {person.id !== data.member.id && (
            <View style={[layout.card, { backgroundColor: color.navySoft }]}>
              <Label role="meta">
                Lo ves porque sos responsable de {person.firstName}.
              </Label>
            </View>
          )}
        </>
      ) : (
        <Label>Carnet no disponible para este vínculo.</Label>
      )}
    </>
  );
}
export default function Carnet() {
  const { person, visit } = useLocalSearchParams<{
    person?: string;
    visit?: string;
  }>();
  return (
    <ExperienceScreen tab showDemoNotice={false}>
      {(data) => (
        <CardView
          key={[person, visit].join('/')}
          data={data}
          initial={person}
        />
      )}
    </ExperienceScreen>
  );
}
