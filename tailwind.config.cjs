const defaultTheme = require('tailwindcss/defaultTheme');
const {
  default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette');
const svgToDataUri = require('mini-svg-data-uri');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './node_modules/streamdown/dist/**/*.js'],
  prefix: '',
  theme: {
    container: {
      center: true,
      // padding: '2rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1600px',
      },
    },
    extend: {
      backgroundImage: {
        male: "url('/onboarding/shared/backgrounds/bg-male.webp')",
        'female-face':
          "url('/onboarding/shared/backgrounds/bg-female-face.webp')",
        spine: "url('/onboarding/shared/backgrounds/bg-spine.webp')",
        'female-hands':
          "url('/onboarding/shared/backgrounds/bg-female-hands.webp')",
        'baseline-membership': "url('/settings/membership/baseline.webp')",
        'advanced-membership': "url('/settings/membership/advanced.webp')",
        home: "url('/home/default.webp')",
        auth: "url('/onboarding/shared/backgrounds/register-bg-alt.webp')",
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        vermillion: {
          50: '#FFF6EA' /* Tag background */,
          100: '#FFEDD5',
          300: '#FED7AA',
          500: '#FDBA74',
          700: '#F7861E',
          900: '#FC5F2B' /* Accent text colour */,
        },
        green: {
          50: '#E9F9F3',
          100: '#A7F3D0',
          300: '#00FCA1',
          500: '#11C182' /* Data points */,
          700: '#26936B' /* Data graph text */,
        },
        yellow: {
          50: '#E8FC00',
          100: '#F7FF9D',
          300: '#E8FC00',
          500: '#D7DB0E' /* Data points */,
          700: '#938700' /* Data graph text */,
        },
        pink: {
          50: '#FBF2F9' /* Error backgrounds */,
          100: '#FFDDF8',
          300: '#FFBEF1',
          500: '#FF68DE' /* Data points */,
          700: '#B90090' /* Error text, background */,
          900: '#84004B',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        // we use proboo because it looks closer to design versions
        sans: ['nbinternationalproboo', ...defaultTheme.fontFamily.sans],
        mono: ['nbinternationalpromono', ...defaultTheme.fontFamily.mono],
        // proreg is secondary font that looks bolder
        proreg: ['nbinternationalproreg', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
        'superpower-logo': {
          '0%, 100%': { fill: '#a1a1aa' }, // zinc-400
          '50%': { fill: '#52525b' }, // zinc-600
        },
        dash: {
          from: { strokeDasharray: '24', strokeDashoffset: '24' },
          to: { strokeDasharray: '24', strokeDashoffset: '0' },
        },
        'jump-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px) rotate(-10deg)' },
        },
        'timeline-flow': {
          '0%': { backgroundPosition: 'right 0px' },
          '100%': { backgroundPosition: 'right 10px' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-safe': {
          '0%': { transform: 'translateZ(0) rotate(0deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        'dot-wave': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'ai-streaming': {
          '0%': { opacity: '0', color: '#FC5F2B', filter: 'blur(2px)' },
          '100%': { opacity: '1', filter: 'blur(0px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'superpower-logo': 'superpower-logo 2s ease-out infinite',
        dash: 'dash 0.3s ease-in-out forwards',
        'jump-up':
          'jump-up 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.75) forwards',
        'timeline-flow': 'timeline-flow 1.5s linear infinite',
        'spin-slow': 'spin-slow 15s linear infinite',
        'spin-safe': 'spin-safe 0.8s linear infinite',
        dot1: 'dot-wave 1.3s infinite',
        dot2: 'dot-wave 1.3s infinite 0.2s',
        dot3: 'dot-wave 1.3s infinite 0.4s',
        'ai-streaming': 'ai-streaming 0.5s ease-out',
      },
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1280px',
      },
      letterSpacing: {
        'display-heading': '-3.84px',
      },
      fontSize: {
        '9xl': ['128px', '144px'],
        '6xl': ['64px', '72px'],
        '3xl': ['32px', '40px'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
    addVariablesForColors,
    function ({ matchUtilities, theme, addUtilities }) {
      matchUtilities(
        {
          'bg-grid': (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
          'bg-grid-small': (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
          'bg-dot': (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
            )}")`,
          }),
        },
        {
          values: flattenColorPalette(theme('backgroundColor')),
          type: 'color',
        },
      );

      addUtilities({
        '.rounded-mask': {
          '-webkit-mask-image':
            'radial-gradient(ellipse at center, black 40%, transparent 70%)',
          'mask-image':
            'radial-gradient(ellipse at center, black 40%, transparent 70%)',
          '-webkit-mask-size': '100% 100%',
          'mask-size': '100% 100%',
          '-webkit-mask-position': 'center',
          'mask-position': 'center',
        },
      });
    },
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ':root': newVars,
  });
}
