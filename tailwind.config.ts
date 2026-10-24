import type { Config } from "tailwindcss";

/**
 * HOT BUN design tokens — bold & bright.
 * Every colour, font, radius, shadow and easing used in the UI lives here;
 * components never reach for raw hex values.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2.5rem" },
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        cream: "#FFFDF7", // page background
        card: "#FFFFFF", // cards, drawers, inputs
        line: "#E9E2D2", // soft dividers (structural borders use ink)
        ink: {
          DEFAULT: "#111111", // text, outlines, dark sections (18.9:1 on cream)
          soft: "#1E1E1E", // raised surfaces on dark
          line: "#333333", // borders on dark
        },
        muted: "#4B4B4B", // secondary text on light (8.6:1)
        fog: "#B8B8B8", // secondary text on dark (9.5:1 on ink)
        tomato: {
          DEFAULT: "#D63A24", // the ONLY action colour (4.7:1 with white)
          deep: "#B42D19", // hover / pressed
          tint: "#FFE1DA",
        },
        mustard: {
          DEFAULT: "#FFC83D", // highlights, stickers, focus on dark
          tint: "#FFF1C2",
        },
        sauce: "#F26A21", // chart bars & decorative orange (validated on white)
        bubblegum: "#FF9EBB", // shake accent, decorative only
        lettuce: { DEFAULT: "#17703D", tint: "#DDF3E4" }, // vegetarian / vegan (5.3:1 on tint)
        chili: { DEFAULT: "#B3340F", tint: "#FFE2D1" }, // spicy (5.1:1 on tint)
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.4rem, 11vw, 10.5rem)", { lineHeight: "0.88", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(2.6rem, 7vw, 5.75rem)", { lineHeight: "0.95", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(2rem, 4.4vw, 3.5rem)", { lineHeight: "1", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.5rem, 2.6vw, 2rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        blob: "2rem",
        ticket: "0.25rem",
      },
      boxShadow: {
        // Hard offset "sticker" shadows — the signature of the bold look.
        pop: "4px 4px 0 0 #111111",
        "pop-lg": "7px 7px 0 0 #111111",
        "pop-sm": "2px 2px 0 0 #111111",
        "pop-mustard": "6px 6px 0 0 #FFC83D",
        card: "0 1px 0 rgba(17,17,17,0.04), 0 10px 30px -14px rgba(17,17,17,0.25)",
        lift: "0 2px 0 rgba(17,17,17,0.04), 0 22px 44px -18px rgba(17,17,17,0.4)",
        ticket: "0 1px 1px rgba(17,17,17,0.06), 0 12px 30px -10px rgba(17,17,17,0.28)",
        "inset-line": "inset 0 0 0 2px #111111",
      },
      transitionTimingFunction: {
        hearth: "cubic-bezier(0.22, 1, 0.36, 1)", // ease-out-quint, reveals
        snap: "cubic-bezier(0.34, 1.56, 0.64, 1)", // overshoot for small UI
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        wobble: "wobble 3s ease-in-out infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
