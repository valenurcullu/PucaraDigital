import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { tokens } from '@pucara/design-tokens';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.color.canvas },
        }}
      />
    </>
  );
}
