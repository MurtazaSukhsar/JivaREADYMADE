import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft dark palette — charcoal, never pure black.
        night: "#1E222A",   // page background
        carbon: "#181B21",  // deeper bands (footer, marquee, hero scrim)
        slate: "#272C35",   // raised surfaces: cards, inputs, image wells
        line: "#3A414D",    // borders / dividers
        cream: "#ECE8E1",   // primary text
        ash: "#9CA4B0",     // muted text
        ember: "#D97B5D",   // primary accent (warm rust)
        brass: "#C9A96A",   // secondary accent
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        lift: "0 18px 40px -24px rgba(0, 0, 0, 0.75)",
        glow: "0 0 0 1px rgba(217, 123, 93, 0.35), 0 12px 32px -18px rgba(217, 123, 93, 0.55)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        tagDrop: {
          "0%": { opacity: "0", transform: "translateY(-6px) rotate(-8deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(-6deg)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        riseIn: "riseIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        tagDrop: "tagDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
