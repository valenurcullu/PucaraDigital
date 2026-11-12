/** Shared values; each platform owns its components and interaction conventions. */
export const tokens = {
  color: {
    brand: '#751D32',
    brandDark: '#541426',
    brandSoft: '#F5E9EC',
    ink: '#202322',
    muted: '#626763',
    canvas: '#F7F7F2',
    surface: '#FFFFFF',
    line: '#DADDD6',
    success: '#236348',
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 },
  radius: { sm: 8, md: 16, lg: 24 },
  type: { caption: 12, body: 16, title: 28, display: 48 },
  motion: { fast: 150, normal: 220 },
} as const;

export { memberTheme } from './member-theme';
