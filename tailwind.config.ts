import type { Config } from "tailwindcss";

// Design tokens locked to Figma values (design/figma/desktop/Desktop - {1..4}.png).
// When updating, the Figma file is the source of truth; bump values here, not in components.
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Figma-locked brand colors
        brown: {
          DEFAULT: "#6a3c3c",
          dark: "#4f2c2a",
        },
        offwhite: "#f5f5f5",
        // Surface neutrals (not yet locked to Figma — header/footer backgrounds)
        cream: {
          50: "#f6efe2",
          100: "#ecdfc6",
          200: "#dccfb1",
        },
        ink: {
          DEFAULT: "#1f1a17",
          muted: "#5a5048",
        },
      },
      fontFamily: {
        // Figma-locked typefaces. Self-hosted via @fontsource(-variable).
        display: ['"DM Serif Display"', "Georgia", "serif"],
        body: ['"Manrope Variable"', "Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Figma desktop type scale. Pair with responsive modifiers
        // (e.g. text-4xl md:text-hero-title) for mobile reductions.
        nav: ["1.25rem", { lineHeight: "1.2", letterSpacing: "0.01em" }],          // 20px (Figma is 30, dialed down for actual nav use)
        "hero-title": ["3rem", { lineHeight: "1.1" }],                              // 48px
        "hero-body": ["1.5rem", { lineHeight: "1.5" }],                             // 24px
        "section-title": ["3rem", { lineHeight: "1.1" }],                           // 48px
        "section-title-xl": ["4rem", { lineHeight: "1.05" }],                       // 64px
        "service-title": ["1.625rem", { lineHeight: "1.3" }],                       // 26px
        "service-desc": ["1.25rem", { lineHeight: "1.5" }],                         // 20px
      },
      maxWidth: {
        prose: "60ch",
        site: "1200px",
      },
    },
  },
  plugins: [],
} satisfies Config;
