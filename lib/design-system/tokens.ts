/**
 * TrueCheckIA Design System - Design Tokens
 * 
 * Centralized design tokens for consistent theming across the application.
 * These tokens define the foundation of our design system.
 */

export const tokens = {
  // Brand Colors - Primary palette for TrueCheckIA
  colors: {
    brand: {
      primary: {
        50: "#f0f4ff",
        100: "#e0eaff", 
        200: "#c7d8ff",
        300: "#a5bfff",
        400: "#839dff",
        500: "#667eea", // Main brand color
        600: "#5a6fd8",
        700: "#4f5dc4",
        800: "#424ba0",
        900: "#3a4080",
        DEFAULT: "#667eea",
        foreground: "#ffffff"
      },
      secondary: {
        50: "#f0fdff",
        100: "#ccf7fe",
        200: "#99eefd",
        300: "#60defa",
        400: "#22c8f0",
        500: "#06b6d4", // Secondary brand color
        600: "#0891b2",
        700: "#0e7490",
        800: "#155e75",
        900: "#164e63",
        DEFAULT: "#06b6d4",
        foreground: "#ffffff"
      },
      accent: {
        50: "#fdf4ff",
        100: "#fae8ff",
        200: "#f5d0fe",
        300: "#f0abfc",
        400: "#e879f9",
        500: "#d946ef",
        600: "#c026d3",
        700: "#a21caf",
        800: "#86198f",
        900: "#701a75",
        DEFAULT: "#d946ef",
        foreground: "#ffffff"
      }
    },
    
    // Semantic Colors
    semantic: {
      success: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        DEFAULT: "#22c55e",
        foreground: "#ffffff"
      },
      warning: {
        50: "#fffbeb",
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f",
        DEFAULT: "#f59e0b",
        foreground: "#ffffff"
      },
      error: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        DEFAULT: "#ef4444",
        foreground: "#ffffff"
      },
      info: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
        DEFAULT: "#3b82f6",
        foreground: "#ffffff"
      }
    },

    // Neutral Colors
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a"
    },

    // Gradients
    gradients: {
      primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      secondary: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      accent: "linear-gradient(135deg, #d946ef 0%, #f97316 100%)",
      success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      cosmic: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      sunset: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
      ocean: "linear-gradient(135deg, #667eea 0%, #06b6d4 100%)"
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      display: ['Cal Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
    },
    fontSize: {
      xs: ['12px', { lineHeight: '16px', letterSpacing: '0.025em' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0.025em' }],
      base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.025em' }],
      xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.025em' }],
      '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.025em' }],
      '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.025em' }],
      '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.025em' }],
      '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.025em' }],
      '6xl': ['60px', { lineHeight: '72px', letterSpacing: '-0.025em' }],
      '7xl': ['72px', { lineHeight: '80px', letterSpacing: '-0.025em' }],
      '8xl': ['96px', { lineHeight: '104px', letterSpacing: '-0.025em' }],
      '9xl': ['144px', { lineHeight: '152px', letterSpacing: '-0.025em' }]
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    }
  },

  // Spacing Scale (based on 4px grid)
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px'
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    DEFAULT: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px'
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
    // Custom brand shadows
    glow: '0 0 20px rgb(102 126 234 / 0.3)',
    'glow-lg': '0 0 40px rgb(102 126 234 / 0.4)',
    'glow-xl': '0 0 60px rgb(102 126 234 / 0.5)'
  },

  // Animation
  animation: {
    duration: {
      instant: '75ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
      slowest: '1000ms'
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'spring-1': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'spring-2': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'spring-3': 'cubic-bezier(0.175, 0.885, 0.32, 1.5)'
    }
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // Breakpoints
  screens: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const;

export type DesignTokens = typeof tokens;

// Helper function to get token values
export const getToken = (path: string): any => {
  return path.split('.').reduce((obj: any, key) => obj?.[key], tokens as any);
};

// CSS Custom Properties for runtime theming
export const cssVariables = {
  light: {
    '--color-brand-primary': tokens.colors.brand.primary.DEFAULT,
    '--color-brand-secondary': tokens.colors.brand.secondary.DEFAULT,
    '--color-brand-accent': tokens.colors.brand.accent.DEFAULT,
    '--color-success': tokens.colors.semantic.success.DEFAULT,
    '--color-warning': tokens.colors.semantic.warning.DEFAULT,
    '--color-error': tokens.colors.semantic.error.DEFAULT,
    '--color-info': tokens.colors.semantic.info.DEFAULT,
    '--gradient-primary': tokens.colors.gradients.primary,
    '--gradient-secondary': tokens.colors.gradients.secondary,
    '--gradient-cosmic': tokens.colors.gradients.cosmic,
    '--shadow-glow': tokens.boxShadow.glow,
    '--border-radius-default': tokens.borderRadius.DEFAULT,
    '--animation-duration-normal': tokens.animation.duration.normal,
    '--animation-easing-spring': tokens.animation.easing['spring-2']
  },
  dark: {
    // Dark mode variations would go here
    '--color-brand-primary': tokens.colors.brand.primary.DEFAULT,
    '--color-brand-secondary': tokens.colors.brand.secondary.DEFAULT,
    '--color-brand-accent': tokens.colors.brand.accent.DEFAULT,
    '--color-success': tokens.colors.semantic.success.DEFAULT,
    '--color-warning': tokens.colors.semantic.warning.DEFAULT,
    '--color-error': tokens.colors.semantic.error.DEFAULT,
    '--color-info': tokens.colors.semantic.info.DEFAULT,
    '--gradient-primary': tokens.colors.gradients.primary,
    '--gradient-secondary': tokens.colors.gradients.secondary,
    '--gradient-cosmic': tokens.colors.gradients.cosmic,
    '--shadow-glow': tokens.boxShadow.glow,
    '--border-radius-default': tokens.borderRadius.DEFAULT,
    '--animation-duration-normal': tokens.animation.duration.normal,
    '--animation-easing-spring': tokens.animation.easing['spring-2']
  }
};