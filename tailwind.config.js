/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './assets/app.js'
  ],
  safelist: [
    {
      pattern: /(bg|text|border|ring)-(brand|emerald|green|amber|orange|purple|blue|rose|red|teal|slate|indigo)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    {
      pattern: /(bg|text|border)-(brand|emerald|green|amber|orange|purple|blue|rose|red|teal|slate|indigo)-(100|200|500|600)\/(10|20|30|40|50|60|70|80|90)/,
    }
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B132B',       /* Midnight Obsidian */
          darklight: '#1C2541',  /* Deep Space Navy */
          orange: '#FF5A36',     /* Sunset Vermillion */
          orangelight: '#FF7A50',/* Coral Peach */
          accent: '#3B82F6',     /* Electric Blue */
          soft: '#F4F7F6',       /* Pure Soft Slate */
          emerald: '#10B981',    /* Mint Emerald */
          purple: '#8B5CF6',     /* Neon Amethyst */
          gold: '#F59E0B',       /* Radiant Gold */
          goldlight: '#FDE68A'   /* Gold Sheen */
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
