import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        'hero-gradient': 'var(--hero-gradient)',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
      },
      transitionProperty: {
        'smooth': 'var(--transition-smooth)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            "background-position": "0% 50%"
          },
          "50%": {
            "background-position": "100% 50%"
          }
        },
        "morph": {
          "0%, 100%": { "border-radius": "60% 40% 30% 70%/60% 30% 70% 40%" },
          "50%": { "border-radius": "30% 60% 70% 40%/50% 60% 30% 60%" }
        },
        "glow": {
          "0%, 100%": { "box-shadow": "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)" },
          "50%": { "box-shadow": "0 0 40px rgba(147, 51, 234, 0.6), 0 0 80px rgba(147, 51, 234, 0.4)" }
        },
        "rainbow": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" }
        },
        "particle": {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) rotate(360deg)", opacity: "0" }
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" }
        },
        "heartbeat": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" }
        },
        "text-glow": {
          "0%, 100%": { "text-shadow": "0 0 5px rgba(0,0,0,0.1)" },
          "50%": { "text-shadow": "0 0 20px rgba(59,130,246,0.6), 0 0 30px rgba(59,130,246,0.4)" }
        },
        "ripple": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(30px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" }
        },
        "slide-in-left": {
          from: { transform: "translateX(-30px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" }
        },
        "slide-in-right": {
          from: { transform: "translateX(30px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" }
        },
        "wave-1": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" }
        },
        "wave-2": {
          "0%, 100%": { transform: "translateY(0px)" },
          "25%": { transform: "translateY(-10px)" },
          "50%": { transform: "translateY(5px)" },
          "75%": { transform: "translateY(-8px)" }
        },
        "rotate-bg": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "25%": { transform: "translateY(-8px) rotate(1deg)" },
          "50%": { transform: "translateY(-12px) rotate(0deg)" },
          "75%": { transform: "translateY(-6px) rotate(-1deg)" }
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0px)" },
          "25%": { transform: "translateY(6px)" },
          "50%": { transform: "translateY(12px)" },
          "75%": { transform: "translateY(4px)" }
        },
        "float-medium": {
          "0%, 100%": { transform: "translateY(0px)" },
          "33%": { transform: "translateY(-8px)" },
          "66%": { transform: "translateY(-4px)" }
        },
        "twist": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" }
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" }
        },
        "glow-light": {
          "0%, 100%": { "box-shadow": "0 0 10px rgba(255,255,255,0.3)" },
          "50%": { "box-shadow": "0 0 20px rgba(255,255,255,0.6)" }
        },
        "morph-circle": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.2) rotate(90deg)" },
          "50%": { transform: "scale(0.8) rotate(180deg)" },
          "75%": { transform: "scale(1.1) rotate(270deg)" }
        },
        "stagger-in": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "bokeh": {
          "0%, 100%": {
            transform: "translate(0px, 0px) rotate(0deg)",
            opacity: "0.6"
          },
          "25%": {
            transform: "translate(30px, -30px) rotate(90deg)",
            opacity: "0.8"
          },
          "50%": {
            transform: "translate(-20px, 20px) rotate(180deg)",
            opacity: "0.4"
          },
          "75%": {
            transform: "translate(10px, -10px) rotate(270deg)",
            opacity: "0.7"
          }
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        },
        "hex-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "type": {
          from: { width: "0" },
          to: { width: "100%" }
        },
        "blink": {
          from: { borderColor: "currentColor" },
          to: { borderColor: "transparent" }
        },
        "bounce-entrance": {
          "0%": { transform: "translateY(30px) scale(0.8)", opacity: "0" },
          "50%": { transform: "translateY(-10px) scale(1.05)", opacity: "0.8" },
          "70%": { transform: "translateY(5px) scale(0.95)", opacity: "1" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite 2s",
        "float-slow": "float-slow 12s ease-in-out infinite",
        "float-reverse": "float-reverse 10s ease-in-out infinite",
        "float-medium": "float-medium 9s ease-in-out infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "morph": "morph 8s ease-in-out infinite",
        "morph-circle": "morph-circle 15s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glow-light": "glow-light 4s ease-in-out infinite alternate",
        "rainbow": "rainbow 3s ease infinite",
        "particle": "particle 10s linear infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "bounce-entrance": "bounce-entrance 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "twist": "twist 6s ease-in-out infinite",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "scale-pulse": "scale-pulse 3s ease-in-out infinite",
        "text-glow": "text-glow 2s ease-in-out infinite alternate",
        "ripple": "ripple 1s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "wave-1": "wave-1 8s ease-in-out infinite",
        "wave-2": "wave-2 10s ease-in-out infinite",
        "rotate-bg": "rotate-bg 20s ease infinite",
        "stagger-in": "stagger-in 0.8s ease-out",
        "bokeh": "bokeh 12s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "hex-rotate": "hex-rotate 15s linear infinite",
        "type": "type 3s steps(40, end)",
        "blink": "blink 1s infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
