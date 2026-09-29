/**
 * Al-Husseiniya Design System Tokens
 * Palette: Deep Navy, Warm Ivory, Muted Teal, Restrained Warm Gold
 * Direction: Professional, Human, Calm, Trustworthy, Culturally Respectful
 */

export const colors = {
  // Brand Primary: Deep Navy
  navy: {
    50: '#F0F4F8',
    100: '#D9E2EC',
    200: '#BCCCDC',
    300: '#9FB3C8',
    400: '#627D98',
    500: '#334E68',
    600: '#243B53',
    700: '#1D3557',
    800: '#12263F',
    900: '#0B1B2B',
  },

  // Brand Secondary: Muted Teal
  teal: {
    50: '#F0FDF4',
    100: '#E0F2F1',
    200: '#B2DFDB',
    300: '#80CBC4',
    400: '#4DB6AC',
    500: '#2A9D8F',
    600: '#1B6B63',
    700: '#14524C',
    800: '#0E3B36',
    900: '#082522',
  },

  // Brand Accent: Restrained Warm Gold
  gold: {
    50: '#FDFBF7',
    100: '#FBF4E6',
    200: '#F5E4BE',
    300: '#EED295',
    400: '#D4AF37',
    500: '#C29B38',
    600: '#A67C1E',
    700: '#7E5B10',
    800: '#5A400A',
    900: '#3D2A04',
  },

  // Warm Ivory & Neutrals
  ivory: {
    50: '#FFFFFF',
    100: '#FAF8F5',
    200: '#F4EFE6',
    300: '#EAE2D5',
    400: '#D7CDC0',
    500: '#B9ABA0',
  },

  // Slate Neutrals
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Semantic Status Colors
  status: {
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", sans-serif',
    arabic: '"Noto Sans Arabic", "Amiri", Tahoma, Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    caption: '0.75rem',    // 12px
    bodySmall: '0.875rem',  // 14px
    body: '1rem',           // 16px
    label: '0.875rem',      // 14px (medium)
    heading3: '1.25rem',    // 20px
    heading2: '1.5rem',     // 24px
    heading1: '2rem',       // 32px
    display: '2.5rem',      // 40px
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const;

export const spacing = {
  0: '0rem',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',  // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem',   // 8px
  xl: '0.75rem',  // 12px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
} as const;

export const themeTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default themeTokens;
