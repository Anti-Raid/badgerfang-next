import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { title, description, keywords } from "@/components/common"

export const metadata: Metadata = {
  title: {
    template: `%s | ${title}`,
    default: `${title} - ${description}`,
  },
  description: `${description}`,
  openGraph: {
    type: "website",
    //locale: "en_US",
    url: "https://antiraid.xyz",
    title: `${title} - ${description}`,
    description: `${description}`,
    siteName: `${title} - ${description}`,
  },
  /*twitter: {
    card: "summary_large_image",
    title: `${title} - ${description}`,
    description: `${description}`,
    site: "@heyantiraid",
    creator: "@heypurrquinox",
  },*/
  /*robots: {
    index: true,
    follow: true,
  },*/
  appleWebApp: {
    title: `${title} - ${description}`,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
  },
}

export const runtime = "edge"

import ClientLayout from "./clientLayout"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Borel&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

