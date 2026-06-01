import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-alt': 'var(--bg-surface-alt)',
        accent: 'var(--accent-primary)',
        'accent-dark': 'var(--accent-primary-dark)',
        navy: 'var(--accent-secondary)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        border: 'var(--border-default)',
        success: 'var(--state-success)',
        warning: 'var(--state-warning)',
        error: 'var(--state-error)',
        info: 'var(--state-info)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-text': 'var(--sidebar-text)',
        'sidebar-active': 'var(--sidebar-active)',
        'sidebar-active-bg': 'var(--sidebar-active-bg)',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
} satisfies Config
