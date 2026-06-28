import type { Metadata } from "next"
import { Anton, DM_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// TODO: reemplazar por el dominio definitivo de Tierra de Hamburguesas
export const metadata: Metadata = {
  metadataBase: new URL("https://www.tierradehamburguesas.com.ar"),
  title: "Tierra de Hamburguesas",
  description: "Sorteos de Tierra de Hamburguesas",
  generator: "v0.dev",
  icons: {
    icon: "/tdh-logo.jpg",
    shortcut: "/tdh-logo.jpg",
    apple: "/tdh-logo.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://www.tierradehamburguesas.com.ar",
    siteName: "Tierra de Hamburguesas",
    title: "Tierra de Hamburguesas",
    description: "Sorteos de Tierra de Hamburguesas",
    images: [
      {
        url: "/tdh-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Logo de Tierra de Hamburguesas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tierra de Hamburguesas",
    description: "Sorteos de Tierra de Hamburguesas",
    images: ["/tdh-logo.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${anton.variable} ${dmSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/tdh-logo.jpg" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
