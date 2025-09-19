export const colors = {
  background: '#ecfdf5', // light mint (matches login/register)
  card: '#ffffff',
  surface: '#ffffff',
  textPrimary: '#0f172a', // slate-900
  textSecondary: '#64748b', // slate-500
  border: '#e2e8f0',
  income: '#34d399', // emerald-400
  expense: '#f87171', // red-400
  accent: '#10b981', // emerald-500
};

export const gradients: {
  screen: [string, string, ...string[]];
  card: [string, string, ...string[]];
  income: [string, string, ...string[]];
  expense: [string, string, ...string[]];
} = {
  screen: ['#ecfdf5', '#d1fae5'],
  card: ['#ffffff', '#f8fafc'],
  income: ['#34d399', '#a7f3d0'],
  expense: ['#f87171', '#fecaca'],
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
};


