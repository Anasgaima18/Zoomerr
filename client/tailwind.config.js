import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Keep existing just in case, but overwrite/add new ones
                background: '#0a0a0b',
                surface: '#121214',
                surfaceHover: '#1c1c1f',
                primary: "#135bec", // New Primary
                primaryHover: '#0f4bc0', // Darker shade for hover
                accent: '#8b5cf6',
                textMain: '#ececf1',
                textMuted: '#9da6b9', // Updated muted text
                border: '#27272a', // Keep existing
                danger: '#ef4444',
                success: '#22c55e',

                // New Design Specifics
                "background-light": "#f6f6f8",
                "background-dark": "#101622",
                "surface-dark": "#1a202c",
                "card-dark": "#1e2128",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Default
                "display": ["Inter", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        typography,
    ],
}
