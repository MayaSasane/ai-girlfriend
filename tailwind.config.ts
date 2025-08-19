import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'avatar-float': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(5deg)' }
                },
                'ambient-pulse': {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' }
                },
                // Correctly placed lightning keyframes
                'lightning-flicker': {
                    '0%, 100%': { opacity: '0.2', transform: 'scale(1) translate(0, 0)' },
                    '5%': { opacity: '1', transform: 'scale(1.2) translate(5px, -5px)' },
                    '10%': { opacity: '0.3', transform: 'scale(0.9) translate(-5px, 5px)' },
                    '20%': { opacity: '0.8', transform: 'scale(1.1) translate(0, 5px)' },
                    '30%': { opacity: '0.1', transform: 'scale(1)' },
                    '40%': { opacity: '0.9', transform: 'scale(1.3) translate(10px, 10px)' },
                    '50%, 95%': { opacity: '0', transform: 'scale(1)' },
                },
                'lightning-glow': {
                    '0%, 100%': { opacity: '0.1', transform: 'translate(0, 0) scale(1)'},
                    '33%': { opacity: '0.5', transform: 'translate(20px, -30px) scale(1.4)'},
                    '66%': { opacity: '0.2', transform: 'translate(-30px, 20px) scale(0.8)'},
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'gate-slide': 'gate-slide 1.5s cubic-bezier(0.23, 1, 0.32, 1) both',
                'empire-reveal': 'empire-reveal 1s ease-out 1.8s both',
                'avatar-float': 'avatar-float 4s ease-in-out infinite',
                'romantic-pulse': 'romantic-pulse 2s ease-in-out infinite',
                'heavenly-entrance': 'heavenly-entrance 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
                'divine-glow': 'divine-glow 4s ease-in-out infinite',
                'ambient-pulse': 'ambient-pulse 3s ease-in-out infinite',
                'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                // Correctly placed lightning animations
                'lightning-1': 'lightning-flicker 3s infinite',
                'lightning-2': 'lightning-flicker 5s infinite 1s',
                'lightning-3': 'lightning-glow 8s infinite 0.5s',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;