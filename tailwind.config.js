/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5', // You can adjust this color to match your design
                    '5': 'rgb(79 70 229 / 0.05)',
                }
            }
        },
    },
    plugins: [
        import('@tailwindcss/forms'),
    ],
    prefix: 'tw-',
}