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
			fontFamily: {
				serif: ['IBM Plex Serif', 'serif'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
        // Dharmic & Sanatan colors
        saffron: "hsl(var(--saffron))",
        "saffron-light": "hsl(var(--saffron-light))",
        "indigo-dharma": "hsl(var(--indigo-dharma))",
        "indigo-light": "hsl(var(--indigo-light))",
        "lotus-pink": "hsl(var(--lotus-pink))",
        turmeric: "hsl(var(--turmeric))",
        "peacock-blue": "hsl(var(--peacock-blue))",
        terracotta: "hsl(var(--terracotta))",
        sandalwood: "hsl(var(--sandalwood))",
        "charcoal-om": "hsl(var(--charcoal-om))",
        
        // Legacy Srangam colors
        ocean: "hsl(var(--ocean))",
        laterite: "hsl(var(--laterite))",
        sand: "hsl(var(--sand))",
        gold: "hsl(var(--gold))",
        ink: "hsl(var(--ink))",
        
        // Nartiang Foundation colors
        burgundy: "hsl(var(--burgundy))",
        "burgundy-light": "hsl(var(--burgundy-light))",
        cream: "hsl(var(--cream))",
        charcoal: "hsl(var(--charcoal))",
        "gold-warm": "hsl(var(--gold-warm))",
        "gold-light": "hsl(var(--gold-light))",
				border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
