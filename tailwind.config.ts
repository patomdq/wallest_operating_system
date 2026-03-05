import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Base tokens ────────────────────────────────
        'wos-bg':           '#0a0a0a',
        'wos-sidebar':      '#111111',
        'wos-card':         '#161616',
        'wos-card-hover':   '#1e1e1e',
        'wos-border':       '#252525',
        'wos-border-light': '#333333',

        // ── Texto BLANCO ───────────────────────────────
        'wos-text':         '#ffffff',   // todo el texto principal
        'wos-text-muted':   '#cccccc',   // texto secundario — gris claro legible
        'wos-text-subtle':  '#888888',   // solo hints y placeholders
        'wos-accent':       '#ffffff',   // títulos

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
