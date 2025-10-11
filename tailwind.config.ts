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
        'wos-bg': '#0a0a0a',
        'wos-sidebar': '#111111',
        'wos-card': '#1a1a1a',
        'wos-border': '#2a2a2a',
        'wos-text': '#e5e5e5',
        'wos-text-muted': '#a0a0a0',
        'wos-accent': '#ffffff',
      },
    },
  },
  plugins: [],
}
export default config
