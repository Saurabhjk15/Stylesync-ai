/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Color Tokens — Warm Editorial Dark ──────────────────────────
      colors: {
        // Backgrounds
        'bg':            '#16130F',
        'surface':       '#1E1A15',
        'card':          '#252017',
        'card-hover':    '#2A2419',
        // Borders
        'border-base':   '#2E2820',
        'border-light':  '#3D3628',
        // Accent — champagne gold: max 2–3 uses per screen
        'accent':        '#C8A97E',
        'accent-hover':  '#B8966A',
        'accent-dim':    'rgba(200,169,126,0.10)',
        'accent-border': 'rgba(200,169,126,0.20)',
        // Text
        'ink':           '#F2EDE6',
        'ink-muted':     '#7A7268',
        'ink-dim':       '#4A4540',
        // Semantic
        'tag-bg':        '#3A3228',
        'ok':            '#4ADE80',
        'err':           '#F87171',
        'info':          '#93C5FD',
        // Legacy aliases (keep for any files not yet upgraded)
        primary:         '#C8A97E',
        'primary-hover': '#B8966A',
        'background-dark': '#16130F',
        'surface-card':  '#252017',
      },

      // ── Typography ────────────────────────────────────────────────
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono:    ['"Inter"', 'ui-monospace', 'monospace'],
        // Retired but kept as alias so any leftover references don't crash
        luxury:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },

      // ── Spacing extras ────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '68': '17rem',
        '76': '19rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ── Font sizes — editorial scale ──────────────────────────────
      fontSize: {
        'display': ['clamp(2.5rem,6vw,5rem)', { lineHeight: '1.05', fontWeight: '300' }],
        'h1':      ['clamp(2rem,4vw,3rem)',   { lineHeight: '1.1',  fontWeight: '400' }],
        'h2':      ['clamp(1.5rem,3vw,2.25rem)', { lineHeight: '1.2', fontWeight: '400' }],
      },

      // ── Border radius ─────────────────────────────────────────────
      borderRadius: {
        DEFAULT: '6px',
        'btn':   '4px',
        'sm':    '4px',
        'md':    '6px',
        'lg':    '8px',
        'xl':    '12px',
        '2xl':   '16px',
        'full':  '9999px',
      },

      // ── Max widths ────────────────────────────────────────────────
      maxWidth: {
        'editorial': '1200px',
        'prose-xl':  '72ch',
      },

      // ── Box shadows — sparse, only modals/overlays ─────────────────
      boxShadow: {
        'modal':  '0 24px 64px rgba(0,0,0,0.6)',
        'card':   '0 2px 12px rgba(0,0,0,0.3)',
        'none':   'none',
      },

      // ── Animations ────────────────────────────────────────────────
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
      },

      keyframes: {
        scan: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ── Background images ─────────────────────────────────────────
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
