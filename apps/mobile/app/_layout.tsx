import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { memberTheme } from '@pucara/design-tokens';
import { ExperienceProvider } from '../features/experience/provider';
export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: '(tabs)' };
export default function RootLayout() {
  const [ready, error] = useFonts({
    BarlowMedium: require('../assets/fonts/BarlowCondensed-Medium.ttf'),
    BarlowSemibold: require('../assets/fonts/BarlowCondensed-SemiBold.ttf'),
    BarlowBold: require('../assets/fonts/BarlowCondensed-Bold.ttf'),
  });
  if (!ready && !error) return null;
  return (
    <ExperienceProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: memberTheme.color.background },
          headerTintColor: memberTheme.color.action,
          headerBackButtonDisplayMode: 'default',
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
            color: memberTheme.color.text,
          },
          contentStyle: { backgroundColor: memberTheme.color.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modulos/[id]" options={{ title: 'Club' }} />
        <Stack.Screen name="partidos/[id]" options={{ title: 'Partido' }} />
        <Stack.Screen name="novedades/[id]" options={{ title: 'Novedades' }} />
        <Stack.Screen name="reservas/[id]" options={{ title: 'Tu reserva' }} />
        <Stack.Screen name="experiencia" options={{ headerShown: false }} />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Página no encontrada' }}
        />
      </Stack>
    </ExperienceProvider>
  );
}
