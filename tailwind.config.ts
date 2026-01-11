import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                gray: {
                    900: '#111',
                    800: '#333',
                    700: '#555',
                    400: '#888', // The requested #888
                }
            },
            fontFamily: {
                plaster: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
