import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Base tokens (CSS vars — cambian con light/dark) ───
        'wos-bg':           'var(--wos-bg)',
        'wos-sidebar':      'var(--wos-sidebar)',
        'wos-card':         'var(--wos-card)',
        'wos-card-hover':   'var(--wos-card-hover)',
        'wos-border':       'var(--wos-border)',
        'wos-border-light': 'var(--wos-border-light)',

        // ── Texto ──────────────────────────────────────
        'wos-text':         'var(--wos-text)',
        'wos-text-muted':   'var(--wos-text-muted)',
        'wos-text-subtle':  'var(--wos-text-subtle)',
        'wos-accent':       'var(--wos-text)',   // títulos

        // ── Marca Wallest ──────────────────────────────
        'brand-orange':     '#F15A29',   // naranja marca
        'brand-orange-dim': '#c44a20',   // naranja hover
        'brand-white':      '#ffffff',
        'brand-black':      '#0a0a0a',

        // ── Áreas (colores sólidos para tarjetas) ──────
        'wallest':          '#1e40af',   // azul solo para tarjeta hub
        'wallest-hover':    '#1d4ed8',
        'renova':           '#ea580c',   // naranja renova
        'renova-hover':     '#c2410c',
        'nexo':             '#16a34a',   // verde nexo
        'nexo-hover':       '#15803d',

        // ── Estados ────────────────────────────────────
        'status-green':     '#4ade80',
        'status-orange':    '#fb923c',
        'status-red':       '#f87171',
        'status-blue':      '#60a5fa',
      },

      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        'wos':    '10px',
        'wos-lg': '14px',
        'wos-xl': '18px',
      },

      boxShadow: {
        'wos':      '0 1px 4px rgba(0,0,0,0.5)',
        'wos-md':   '0 4px 16px rgba(0,0,0,0.6)',
        'brand':    '0 8px 30px rgba(241,90,41,0.25)',
        'renova':   '0 8px 30px rgba(234,88,12,0.25)',
        'nexo':     '0 8px 30px rgba(22,163,74,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
