import { DefaultTheme } from '@react-navigation/native';

export const appColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',

  text: '#0F172A',
  textMuted: '#475569',
  textSoft: '#64748B',

  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  primarySoft: '#DBEAFE',

  border: '#E2E8F0',
  divider: '#E5E7EB',

  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',

  icon: '#334155',
  iconMuted: '#64748B',

  tabActive: '#2563EB',
  tabInactive: '#64748B',

  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputPlaceholder: '#94A3B8',
  inputText: '#0F172A',
  inputFocus: '#2563EB',

  buttonText: '#FFFFFF',
  buttonSecondaryBackground: '#EFF6FF',
  buttonSecondaryText: '#1D4ED8',

  mapRoute: '#2563EB',
  mapOrigin: '#16A34A',
  mapDestination: '#DC2626',
} as const;

export type AppColors = typeof appColors;

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: appColors.primary,
    background: appColors.background,
    card: appColors.surface,
    text: appColors.text,
    border: appColors.border,
    notification: appColors.primary,
  },
} as const;