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
				tamil: ['Noto Sans Tamil', 'serif', 'sans-serif'],
				telugu: ['Noto Sans Telugu', 'serif', 'sans-serif'],
				kannada: ['Noto Sans Kannada', 'serif', 'sans-serif'],
				bengali: ['Noto Sans Bengali', 'Noto Serif Bengali', 'serif', 'sans-serif'],
				assamese: ['Noto Serif Bengali', 'Noto Sans Bengali', 'serif', 'sans-serif'], // Enhanced Assamese support
				devanagari: ['Noto Serif Devanagari', 'serif'],
				hindi: ['Noto Serif Devanagari', 'serif'],
				punjabi: ['Noto Sans Gurmukhi', 'sans-serif'],
				gurmukhi: ['Noto Sans Gurmukhi', 'sans-serif'],
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
        
        // Srangam Brand Colors
        oceanTeal: "hsl(var(--ocean-teal))",
        epigraphyMaroon: "hsl(var(--epigraphy-maroon))",
        ink: "hsl(var(--ink))",
        
        // Legacy Srangam colors
        ocean: "hsl(var(--ocean))",
        laterite: "hsl(var(--laterite))",
        sand: "hsl(var(--sand))",
        gold: "hsl(var(--gold))",
        
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
				},
				// Fade Animations
				"fade-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				"fade-out": {
					"0%": {
						opacity: "1",
						transform: "translateY(0)"
					},
					"100%": {
						opacity: "0",
						transform: "translateY(10px)"
					}
				},
				
				// Scale Animations
				"scale-in": {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
				"scale-out": {
					from: { transform: "scale(1)", opacity: "1" },
					to: { transform: "scale(0.95)", opacity: "0" }
				},
				
				// Optimized Dharmic Animations
				'slow-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'reverse-spin': {
					'0%': { transform: 'rotate(360deg)' },
					'100%': { transform: 'rotate(0deg)' }
				},
				'pulse-gentle': {
					'0%, 100%': { 
						transform: 'scale(1)',
						opacity: '0.7'
					},
					'50%': { 
						transform: 'scale(1.02)',
						opacity: '1'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px hsl(var(--saffron) / 0.3)'
					},
					'50%': { 
						boxShadow: '0 0 20px hsl(var(--saffron) / 0.6), 0 0 30px hsl(var(--gold-warm) / 0.4)'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
            "dharma-spin": "dharma-spin 12s linear infinite",
            "chakra-spin": "chakra-spin 15s linear infinite",
            "slow-spin": "slow-spin 20s linear infinite",
            "reverse-spin": "reverse-spin 25s linear infinite",
            "lotus-bloom": "lotus-bloom 0.8s ease-out forwards",
            "om-pulse": "om-pulse 4s ease-in-out infinite",
            "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
            "sanskrit-glow": "sanskrit-glow 3s ease-in-out infinite alternate",
            "sacred-float": "sacred-float 6s ease-in-out infinite",
            "mandala-rotation": "mandala-rotation 30s linear infinite",
            "gentle-bounce": "gentle-bounce 3s ease-in-out infinite"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
