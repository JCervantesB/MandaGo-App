export const tailwindTheme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-muted': '#F1F5F9',

    text: '#0F172A',
    'text-muted': '#475569',
    'text-soft': '#64748B',

    primary: '#2563EB',
    'primary-pressed': '#1D4ED8',
    'primary-soft': '#DBEAFE',

    border: '#E2E8F0',
    divider: '#E5E7EB',

    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',

    icon: '#334155',
    'icon-muted': '#64748B',

    'tab-active': '#2563EB',
    'tab-inactive': '#64748B',

    'input-background': '#FFFFFF',
    'input-border': '#CBD5E1',
    'input-placeholder': '#94A3B8',
    'input-text': '#0F172A',
    'input-focus': '#2563EB',

    'button-text': '#FFFFFF',
    'button-secondary-background': '#EFF6FF',
    'button-secondary-text': '#1D4ED8',

    'map-route': '#2563EB',
    'map-origin': '#16A34A',
    'map-destination': '#DC2626',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
} as const;

export type TailwindTheme = typeof tailwindTheme;