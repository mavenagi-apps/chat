import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        sm: "448px",
        md: "524px",
      },
      colors: {
        primary: {
          50: "#F6F5FF",
          100: "#EDEBFE",
          200: "#DCD7FE",
          300: "#CABFFD",
          400: "#AC94FA",
          500: "#9061F9",
          600: "#7E3AF2",
          700: "#6C2BD9",
          800: "#5521B5",
          900: "#4A1D96",
        },
        fg: {
          brand: "#6C2BD9",
          primary: "#111928",
          secondary: "#374151",
          tertiary: "#9CA3AF",
          subtle: "#E5E7EB",
          success: "#057A55",
          danger: "#E02424",
          warning: "#9F580A",
          info: "#1C64F2",
          inverse: {
            primary: "#FFFFFF",
            secondary: "#9CA3AF",
            accent: "#6C2BD9",
          },
        },
        bg: {
          primary: "#FFFFFF",
          secondary: "#F3F4F6",
          tertiary: "#E5E7EB",
          accent: "#6C2BD9",
          success: "#DEF7EC",
          danger: "#FDE8E8",
          warning: "#FDF6B2",
          info: "#E1EFFE",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
