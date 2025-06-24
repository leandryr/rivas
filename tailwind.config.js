// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      // (Opcional) personaliza el plugin de tipografía:
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // Ejemplo: cambiar color de enlaces por defecto
            a: {
              color: theme('colors.blue.600'),
              '&:hover': { color: theme('colors.blue.700') },
            },
            // ...más overrides si quieres
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
