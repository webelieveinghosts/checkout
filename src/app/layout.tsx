import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/global.css"

export const metadata: Metadata = {
    title: "WBG",
    description: "we believe in ghosts",
}

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`w-full h-screen ${inter.className} overflow-hidden antialiased`}>
                {children}
            </body>
        </html>
    )
}