export type ThemeMode = 'dark' | 'light';

export const PriorityColors = {
  urgent: {
    main: '#FF7A29',
    tint: 'rgba(255, 122, 41, 0.12)',
    border: 'rgba(255, 122, 41, 0.3)',
    glow: 'rgba(255, 122, 41, 0.35)',
    contrast: '#FFFFFF',
  },
  high: {
    main: '#29A8FF',
    tint: 'rgba(41, 168, 255, 0.12)',
    border: 'rgba(41, 168, 255, 0.3)',
    glow: 'rgba(41, 168, 255, 0.35)',
    contrast: '#FFFFFF',
  },
  low: {
    main: '#10B981',
    tint: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    glow: 'rgba(16, 185, 129, 0.35)',
    contrast: '#FFFFFF',
  },
};

export const Themes = {
  dark: {
    canvas: '#0E1013',
    surface: '#171A21',
    surfaceSubtle: 'rgba(23, 26, 33, 0.7)',
    elevated: '#1F242E',
    stroke: '#2A313E',
    strokeSubtle: 'rgba(42, 49, 62, 0.7)',
    textPrimary: '#F0F3F8',
    textSecondary: '#9BA3AF',
    textMuted: '#525D6D',
    inputBg: '#16181E',
    bottomBarBg: 'rgba(14, 16, 19, 0.96)',
    drawerBg: 'rgba(14, 16, 19, 0.98)',
    shadowColor: '#000000',
    railwaySpine: '#2A313E',
  },
  light: {
    canvas: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: 'rgba(255, 255, 255, 0.85)',
    elevated: '#F1F5F9',
    stroke: '#E2E8F0',
    strokeSubtle: 'rgba(226, 232, 240, 0.7)',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    inputBg: '#F1F5F9',
    bottomBarBg: 'rgba(248, 250, 252, 0.96)',
    drawerBg: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#64748B',
    railwaySpine: '#E2E8F0',
  },
};

export const Typography = {
  fontFamily: {
    serif: 'SourceSerif4_700Bold',
    serifItalic: 'SourceSerif4_400Regular_Italic',
    sans: 'PlusJakartaSans_400Regular',
    sansMedium: 'PlusJakartaSans_500Medium',
    sansSemiBold: 'PlusJakartaSans_600SemiBold',
    sansBold: 'PlusJakartaSans_700Bold',
  },
};
