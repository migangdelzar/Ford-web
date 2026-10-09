import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFA',
        card: '#FFFFFF',
        border: '#F1F2F4',
        accent: {
          DEFAULT: '#2563EB',
          soft: '#EFF4FE',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#0891B2',
      },
      fontSize: {
        label: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        base: ['15px', { lineHeight: '22px', fontWeight: '400' }],
        title: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        page: ['24px', { lineHeight: '32px', fontWeight: '700' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '16px',
        4: '24px',
        6: '32px',
        8: '48px',
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
      },
    },
  },
  plugins: [],
} satisfies Config;
