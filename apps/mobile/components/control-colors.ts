import { memberTheme as theme } from '@pucara/design-tokens';
const c = theme.color;
export const controlColors = {
  primary: {
    fill: c.action,
    pressed: c.actionPressed,
    ink: c.inverseText,
    border: c.action,
  },
  secondary: {
    fill: c.surface,
    pressed: c.navySoft,
    ink: c.navy,
    border: c.controlBorder,
  },
  tonal: {
    fill: c.navySoft,
    pressed: c.subtle,
    ink: c.navy,
    border: c.controlBorder,
  },
  selected: {
    fill: c.navy,
    pressed: c.navyPressed,
    ink: c.inverseText,
    border: c.navy,
  },
  destructive: {
    fill: c.errorBackground,
    pressed: c.actionSoft,
    ink: c.error,
    border: c.error,
  },
  disabled: {
    fill: c.subtle,
    pressed: c.subtle,
    ink: c.secondaryText,
    border: c.border,
  },
} as const;
export type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'destructive';
export function buttonColors(variant: ButtonVariant, disabled: boolean) {
  return controlColors[disabled ? 'disabled' : variant];
}
