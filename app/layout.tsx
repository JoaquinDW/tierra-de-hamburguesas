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
  title: "Agustin Premios",
  description: "Agustin Premios",
  icons: {
    icon: "/tdh-logo.jpeg",
    shortcut: "/tdh-logo.jpeg",
    apple: "/tdh-logo.jpeg",
  },
  openGraph: {
    type: "website",
    url: "https://www.agustinpremios.com",
    siteName: "Agustin Premios",
    title: "Agustin Premios",
    description: "Sorteos de Agustin Premios",
    images: [
      {
        url: "/tdh-logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Logo de Agustin Premios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agustin Premios",
    description: "Sorteos de Agustin Premios",
    images: ["/tdh-logo.jpeg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${dmSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/tdh-logo.jpeg" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
