/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        ice: {
          25: '#fbfdff',
          50: '#f3f9fe',
          100: '#e7f2fc',
          200: '#d3e8f8',
          300: '#b7d9f3',
        },
        blue: {
          50: '#f0f7fd',
          100: '#dcedfb',
          200: '#b9d9f6',
          300: '#8ec3ef',
          400: '#5aa8e4',
          500: '#2f8cd0',
          600: '#1c6fb2',
          700: '#17598f',
          800: '#164a75',
        },
        navy: {
          700: '#1b3a5c',
          800: '#122c49',
          900: '#0b1f38',
          950: '#071629',
        },
        slate: {
          50: '#f7f9fb',
          100: '#eef2f6',
          200: '#e0e7ee',
          300: '#c8d3de',
          400: '#94a5b7',
          500: '#687d92',
          600: '#4d6076',
          700: '#3a4c60',
        },
        confidence: {
          high: '#4fa8dd',
          moderate: '#2c7fbe',
          low: '#f0a15c',
          verylow: '#e2574c',
        },
        risk: {
          low: '#7ec8e8',
          moderate: '#f2c14e',
          high: '#ef9455',
          critical: '#dd5145',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,31,56,0.04), 0 6px 20px -8px rgba(11,31,56,0.10)',
        lift: '0 2px 4px rgba(11,31,56,0.05), 0 14px 34px -12px rgba(11,31,56,0.18)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.55' },
          '70%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        driftX: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        fadeIn: 'fadeIn 0.5s ease both',
        shimmer: 'shimmer 1.6s linear infinite',
        scan: 'scan 3.4s ease-in-out infinite',
        pulseRing: 'pulseRing 2.6s ease-out infinite',
        driftX: 'driftX 42s linear infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
