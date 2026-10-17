/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FORJ Forge palette
        ink:       "#1C1B19",
        bone:      "#F4F1EA",
        paper:     "#FFFFFF",
        ember:     "#D9531E",
        "ember-dark": "#B8421A",
        steel:     "#4A5560",
        "steel-light": "#D8D3C8",
        brass:     "#B8893B",
        success:   "#3F7D4E",
        warning:   "#C98A1B",
        danger:    "#B3261E",
      },
      fontFamily: {
        heading: ["Fraunces", "Georgia", "serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(28,27,25,0.08), 0 1px 2px -1px rgba(28,27,25,0.06)",
        "card-hover": "0 4px 12px 0 rgba(28,27,25,0.12), 0 2px 4px -1px rgba(28,27,25,0.08)",
        ember: "0 2px 8px 0 rgba(217,83,30,0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.35s ease-out",
        "pulse-ember": "pulseEmber 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-gentle": "bounceGentle 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseEmber: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217,83,30,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(217,83,30,0.15)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      transitionTimingFunction: {
        "forge": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
