/** Provisional A. Separate from the legacy web palette until its own design block. */
export const memberTheme = {
  color: {
    background: '#F6F4EF',
    surface: '#FFFFFF',
    subtle: '#EEEDE7',
    text: '#18283B',
    secondaryText: '#586575',
    inverseText: '#FFFFFF',
    action: '#BC2438',
    actionPressed: '#981B2C',
    navy: '#14263D',
    border: '#DEDED8',
    controlBorder: '#8490A0',
    success: '#226243',
    successBackground: '#E8F3ED',
    error: '#9F2030',
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { control: 8, card: 12 },
  type: { caption: 12, secondary: 14, body: 16, section: 22, title: 34 },
  touch: { minimum: 48 },
} as const;
