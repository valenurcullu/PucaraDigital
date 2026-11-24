import { createContext, useContext, useState, type ReactNode } from 'react';
import { Switch, View } from 'react-native';
import { Label, layout, color } from '../../components/handoff-ui';
import { DemoCaption } from '../experience/identity-ui';
const defaults = { agenda: true, club: false };
const Prefs = createContext<{
  values: typeof defaults;
  toggle: (key: keyof typeof defaults) => void;
} | null>(null);
export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [values, set] = useState(defaults);
  return (
    <Prefs.Provider
      value={{
        values,
        toggle: (key) => set((old) => ({ ...old, [key]: !old[key] })),
      }}
    >
      {children}
    </Prefs.Provider>
  );
}
export function Preferences() {
  const settings = useContext(Prefs);
  if (!settings) throw Error('Preferencias fuera de Cuenta');
  return (
    <>
      <Label role="section">Notificaciones</Label>
      <View style={[layout.card, layout.group]}>
        {(['agenda', 'club'] as const).map((key, i) => {
          const title = i ? 'Comunicados del club' : 'Recordatorios de Agenda';
          return (
            <View key={key} style={[layout.row, { minHeight: 48 }]}>
              <Label role="card" style={layout.grow}>
                {title}
              </Label>
              <Switch
                accessibilityLabel={title}
                value={settings.values[key]}
                onValueChange={() => settings.toggle(key)}
                trackColor={{ true: color.navy }}
              />
            </View>
          );
        })}
      </View>
      <DemoCaption>
        Preferencias de esta sesión demo. El envío de notificaciones está
        pendiente.
      </DemoCaption>
    </>
  );
}
