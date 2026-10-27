/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'rgb(var(--color-dark-navy) / <alpha-value>)',
        ivory: 'rgb(var(--color-warm-cream) / <alpha-value>)',
        gold: 'rgb(var(--color-gold-ink) / <alpha-value>)',
        'gold-bright': 'rgb(var(--color-gold) / <alpha-value>)',
        green: 'rgb(var(--color-teal-ink) / <alpha-value>)',
        'royal-purple': 'rgb(var(--color-royal-purple) / <alpha-value>)',
        'deep-indigo': 'rgb(var(--color-deep-indigo) / <alpha-value>)',
        'vibrant-violet': 'rgb(var(--color-vibrant-violet) / <alpha-value>)',
        coral: 'rgb(var(--color-coral) / <alpha-value>)',
        teal: 'rgb(var(--color-teal) / <alpha-value>)',
        'soft-lavender': 'rgb(var(--color-soft-lavender) / <alpha-value>)',
        'warm-cream': 'rgb(var(--color-warm-cream) / <alpha-value>)',
        body: 'rgb(var(--color-body) / <alpha-value>)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        header: 'var(--shadow-header)',
      },
      fontFamily: {
        display: ['var(--font-heading)'],
        sans: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
};
