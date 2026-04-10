import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c211d",
        clinic: "#0f766e",
        signal: "#c2410c",
        line: "#d7ddd9",
        muted: "#66706a",
        panel: "#fbfcfb",
        surface: "#f5f7f6",
      },
    },
  },
  plugins: [],
};

export default config;
