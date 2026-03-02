export const LIGHT_COLORS = {
    bg: '#F8FAFC',
    surface: 'rgba(0, 0, 0, 0.03)',
    surfaceDark: 'rgba(0, 0, 0, 0.1)',
    surface2: '#F1F5F9',
    border: 'rgba(0, 0, 0, 0.08)',
    accent: '#8B5CF6',
    accentSecondary: '#3B82F6',
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    success: '#10B981',
    danger: '#EF4444',
    white: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(0, 0, 0, 0.05)',
};

export const DARK_COLORS = {
    bg: '#16191E',
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceDark: 'rgba(0, 0, 0, 0.4)',
    surface2: '#23272E',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: '#A78BFA',
    accentSecondary: '#60A5FA',
    text: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    success: '#34D399',
    danger: '#F87171',
    white: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
};

// Default (legacy) export to avoid breaking everything immediately
// But we should use the dynamic one via context
export const COLORS = DARK_COLORS;

export const GRADIENTS = {
    accent: ['#8B5CF6', '#3B82F6'] as const,
    card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)'] as const,
    header: ['#0F1115', 'transparent'] as const,
    bento: ['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.05)'] as const,
};

export const RADII = {
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    xxl: 40,
};

export const FONT = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};
