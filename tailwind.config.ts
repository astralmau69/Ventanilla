import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      /* ─── Familias tipográficas ─── */
      fontFamily: {
        sans:    ["var(--font-atkinson)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        serif:   ["var(--font-cormorant)", "Georgia", "serif"],
        ui:      ["var(--font-atkinson)", "system-ui", "sans-serif"],
      },

      /* ─── Colores mapeados a CSS variables ─── */
      colors: {
        background:    "var(--background)",
        surface:       "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        primary:       "var(--primary-text)",
        muted:         "var(--muted-text)",
        subtle:        "var(--subtle-text)",
        accent:        "var(--accent)",
        "accent-fg":   "var(--accent-fg)",
        gold:          "var(--gold)",
        "gold-light":  "var(--gold-light)",
        "gold-fg":     "var(--gold-fg)",
        success:       "var(--success)",
        danger:        "var(--danger)",
        border:        "var(--border)",
        "border-strong": "var(--border-strong)",
      },

      /* ─── Escala tipográfica kiosco (adultos mayores) ─── */
      fontSize: {
        xs:        ["0.875rem",  { lineHeight: "1.4" }],
        sm:        ["1rem",      { lineHeight: "1.4" }],
        base:      ["1.25rem",   { lineHeight: "1.5" }],
        lg:        ["1.5rem",    { lineHeight: "1.4" }],
        xl:        ["2rem",      { lineHeight: "1.3" }],
        "2xl":     ["2.5rem",    { lineHeight: "1.25" }],
        "3xl":     ["3rem",      { lineHeight: "1.2" }],
        "4xl":     ["4rem",      { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "5xl":     ["5rem",      { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "6xl":     ["6rem",      { lineHeight: "1", letterSpacing: "-0.02em" }],
        "7xl":     ["7.5rem",    { lineHeight: "1", letterSpacing: "-0.025em" }],
        /* Alias semánticos */
        "body":    ["2rem",      { lineHeight: "1.5" }],
        "body-sm": ["1.5rem",    { lineHeight: "1.5" }],
        "label":   ["1.125rem",  { lineHeight: "1.4" }],
        "btn":     ["1.5rem",    { lineHeight: "1", fontWeight: "600" }],
        "btn-lg":  ["2rem",      { lineHeight: "1", fontWeight: "600" }],
        "h3":      ["2.25rem",   { lineHeight: "1.25" }],
        "h2":      ["3rem",      { lineHeight: "1.2" }],
        "h1":      ["4.5rem",    { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display": ["7.5rem",    { lineHeight: "1", letterSpacing: "-0.02em" }],
      },

      /* ─── Touch targets ─── */
      minWidth:  { touch: "5.5rem", "touch-lg": "7.5rem" },
      minHeight: { touch: "5.5rem", "touch-lg": "7.5rem" },
      gap: {
        touch:    "1.5rem",
        "touch-sm": "1rem",
      },

      /* ─── Bordes ─── */
      borderRadius: {
        kiosk: "1.25rem",
        pill:  "9999px",
        card:  "1.5rem",
        xs:    "0.5rem",
      },
      borderWidth: {
        DEFAULT: "1px",
        "0":     "0",
        "2":     "2px",
      },

      /* ─── Sombras elegantes ─── */
      boxShadow: {
        xs:   "var(--shadow-xs)",
        sm:   "var(--shadow-sm)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        card: "var(--shadow-card)",
        none: "none",
      },

      /* ─── Espaciado y transiciones ─── */
      transitionDuration: {
        fast:  "150ms",
        base:  "250ms",
        slow:  "400ms",
        xslow: "700ms",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-expo":  "cubic-bezier(0.7, 0, 0.84, 0)",
      },

      /* ─── Tracking personalizado ─── */
      letterSpacing: {
        tight:   "-0.02em",
        snug:    "-0.01em",
        normal:  "0",
        wide:    "0.06em",
        wider:   "0.12em",
        widest:  "0.22em",
        "spaced":"0.30em",
      },
    },
  },
  plugins: [],
};

export default config;
