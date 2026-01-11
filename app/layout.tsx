import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'kugcc | Desktop Coffee Lab',
    description: 'Professional coffee brewing management',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-black text-white antialiased selection:bg-white selection:text-black`}>
                {children}
            </body>
        </html>
    )
}
