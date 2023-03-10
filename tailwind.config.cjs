/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontSize: {
        mega: "6rem",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
            img: {
              margin: "0 auto",
            },
            "h1, h2, h3, h4, h5, h6": {
              color: theme("colors.gray.900"),
              marginBottom: theme("margin.3"),
            },
            code: {
              fontWeight: "inherit",
              color: theme("colors.gray.700"),
              borderRadius: theme("border.sm"),
              padding: theme("padding.1"),
              background: theme("colors.gray.200"),
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
