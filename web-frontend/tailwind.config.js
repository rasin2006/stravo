/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#52796F',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#D4A373',
          foreground: '#1B4332',
        },
        route: '#2563EB',
        background: '#F7F5F0',
        surface: '#FFFFFF',
        foreground: '#1B4332',
        muted: {
          DEFAULT: '#64748B',
          foreground: '#64748B',
        },
        border: '#E2E8D8',
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        recording: '#EF4444',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(27, 67, 50, 0.08)',
        sheet: '0 -4px 24px rgba(27, 67, 50, 0.12)',
      },
    },
  },
  plugins: [],
};
