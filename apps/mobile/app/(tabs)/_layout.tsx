import { Platform } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { memberTheme as theme } from '@pucara/design-tokens';

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={theme.color.action}
      blurEffect="systemChromeMaterialLight"
      backgroundColor={
        Platform.OS === 'android'
          ? theme.color.androidNavBg
          : 'rgba(255,255,255,0.9)'
      }
      iconColor={{
        default: theme.color.tabInactive,
        selected:
          Platform.OS === 'android' ? theme.color.navy : theme.color.action,
      }}
      labelStyle={{
        default: {
          fontSize: 11,
          fontWeight: '500',
          color: theme.color.tabInactive,
        },
        selected: {
          fontSize: 11,
          fontWeight: '700',
          color: theme.color.action,
        },
      }}
      indicatorColor={theme.color.androidTabPill}
      rippleColor={theme.color.actionSoft}
      shadowColor={theme.color.border}
      minimizeBehavior="never"
      backBehavior="history"
      disableTransparentOnScrollEdge
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger disableAutomaticContentInsets name="(inicio)">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="agenda">
        <NativeTabs.Trigger.Label>Agenda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar.circle.fill' }}
          md="calendar_month"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="carnet">
        <NativeTabs.Trigger.Label>Carnet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'person.text.rectangle',
            selected: 'person.text.rectangle.fill',
          }}
          md="badge"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="club">
        <NativeTabs.Trigger.Label>Club</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sportscourt', selected: 'sportscourt.fill' }}
          md="stadium"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="cuenta">
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
