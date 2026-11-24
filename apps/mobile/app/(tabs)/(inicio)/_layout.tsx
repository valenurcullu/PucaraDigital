import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { memberTheme as theme } from '@pucara/design-tokens';
export const unstable_settings = { initialRouteName: 'index' };
export default function MemberStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.color.background },
        headerTintColor: theme.color.action,
        headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',
        headerTitleStyle: {
          fontSize: Platform.OS === 'ios' ? 17 : 21,
          fontWeight: Platform.OS === 'ios' ? '600' : '500',
          color: theme.color.text,
        },
        contentStyle: { backgroundColor: theme.color.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          statusBarStyle: 'light',
          title: 'Inicio',
        }}
      />
      <Stack.Screen name="turnos" options={{ title: 'Pádel' }} />
      <Stack.Screen
        name="fixture"
        options={{ title: 'Fixture y resultados' }}
      />
    </Stack>
  );
}
