import { NativeTabs } from 'expo-router/native-tabs';
import { memberTheme as theme } from '@pucara/design-tokens';

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={theme.color.action}
      backgroundColor={theme.color.surface}
      iconColor={{
        default: theme.color.secondaryText,
        selected: theme.color.action,
      }}
      labelStyle={{
        default: {
          fontSize: 12,
          fontWeight: '500',
          color: theme.color.secondaryText,
        },
        selected: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.color.action,
        },
      }}
      indicatorColor={theme.color.actionSoft}
      rippleColor={theme.color.actionSoft}
      shadowColor={theme.color.border}
      minimizeBehavior="never"
      backBehavior="history"
      disableTransparentOnScrollEdge
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="agenda">
        <NativeTabs.Trigger.Label>Agenda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar.circle.fill' }}
          md="calendar_month"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="carnet">
        <NativeTabs.Trigger.Label>Carnet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'person.crop.rectangle',
            selected: 'person.crop.rectangle.fill',
          }}
          md="badge"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="club">
        <NativeTabs.Trigger.Label>Club</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'building.2', selected: 'building.2.fill' }}
          md="sports_tennis"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cuenta">
        <NativeTabs.Trigger.Label>Cuenta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'person.crop.circle',
            selected: 'person.crop.circle.fill',
          }}
          md="account_circle"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
