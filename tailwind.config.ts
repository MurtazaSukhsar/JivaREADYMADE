import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Jiva brand palette — dark maroon / crimson.
        night: "#1A0008",   // page background (very dark maroon)
        carbon: "#120005",  // deeper bands (footer, hero scrim)
        slate: "#2A0010",   // raised surfaces: cards, inputs, image wells
        line: "#5C1020",    // borders / dividers
        cream: "#FFFFFF",   // primary text (pure white)
        ash: "#FFFFFF",     // muted text (pure white)
        ember: "#D91A3C",   // primary accent (crimson red)
        brass: "#E8956B",   // secondary accent (warm orange)
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        lift: "0 18px 40px -24px rgba(0, 0, 0, 0.75)",
        glow: "0 0 0 1px rgba(217, 26, 60, 0.4), 0 12px 32px -18px rgba(217, 26, 60, 0.6)",
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
