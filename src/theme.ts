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
  xl: 24,
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

// Web-compatible shadow utility
export const shadows = {
  small: {
    ...(typeof window !== 'undefined' ? {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    })
  },
  medium: {
    ...(typeof window !== 'undefined' ? {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    })
  },
  large: {
    ...(typeof window !== 'undefined' ? {
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    })
  }
};


