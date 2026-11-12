import { NativeTabs } from 'expo-router/native-tabs';
import { memberTheme } from '@pucara/design-tokens';
export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={memberTheme.color.action}
      backgroundColor={memberTheme.color.surface}
      backBehavior="history"
      disableTransparentOnScrollEdge
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="agenda">
        <NativeTabs.Trigger.Label>Agenda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="carnet">
        <NativeTabs.Trigger.Label>Carnet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.rectangle" md="badge" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="club">
        <NativeTabs.Trigger.Label>Club</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sportscourt.fill" md="sports_tennis" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cuenta">
        <NativeTabs.Trigger.Label>Cuenta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
