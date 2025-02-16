/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    fontFamily: { sans: ['"Figtree Variable", sans-serif'] },
    fontWeight: {
      thin: "100",
      hairline: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "550",
      bold: "700",
      extrabold: "800",
      "extra-bold": "800",
      black: "900",
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
            img: { margin: "0 auto", maxWidth: "100%" },
            figcaption: { textAlign: "center" },
            a: { color: "var('--color-gray-800')", textDecoration: "none" },
            "a code": {
              background: "none",
              fontSize: "inherit",
              fontFamily: "inherit",
              padding: "0",
            },
            strong: { color: "var('--color-gray-800')" },
            "h1, h2, h3, h4, h5, h6": {
              color: "var('--color-gray-900')",
              marginBottom: `theme("margin.3") !important`,
              fontWeight: `650`,
            },
            "h1 a, h2 a, h3 a, h4 a, h5 a, h6 a": { fontWeight: "inherit" },
            code: {
              fontWeight: "inherit",
              color: "var('--color-gray-700')",
              borderRadius: theme("border.sm"),
              padding: theme("padding.1"),
              background: "var('--color-gray-200')",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            "strong *": { fontWeight: "inherit", color: "inherit" },
            blockquote: { fontWeight: "inherit" },
          },
        },
      }),
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
    function ({ addVariant, addUtilities, theme }) {
      addUtilities({ ".red-copy *": { color: "var('--color-rose-600')" } });
      addVariant("child-link", "& > a");
      addVariant("child-link-hover", "& > a:hover");
    },
  ],
};
