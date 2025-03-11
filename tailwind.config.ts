import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/packages/components/**/*.{js,ts,jsx,tsx,mdx}",
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
          "50": "#F6F5FF",
          "100": "#EDEBFE",
          "200": "#DCD7FE",
          "300": "#CABFFD",
          "400": "#AC94FA",
          "500": "#9061F9",
          "600": "#7E3AF2",
          "700": "#6C2BD9",
          "800": "#5521B5",
          "900": "#4A1D96",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
export default config;
