import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AccessibilityProvider } from '@/components/accessibility-provider'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Sabor da Fé - Temperos com o Gosto da Eternidade',
  description: 'Loja de temperos da Organização dos Rapazes (OR) da Igreja de Jesus Cristo dos Santos dos Últimos Dias. Ajude a espalhar a luz de Cristo pelo mundo.',
  generator: 'v0.app',
  keywords: ['temperos', 'especiarias', 'SUD', 'Igreja de Jesus Cristo', 'Organização dos Rapazes', 'OR'],
  authors: [{ name: 'Sabor da Fé' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Sabor da Fé - Temperos com o Gosto da Eternidade',
    description: 'Loja de temperos da Organização dos Rapazes (OR) da Igreja de Jesus Cristo dos Santos dos Últimos Dias.',
    url: 'https://sabordafesud.com.br',
    siteName: 'Sabor da Fé',
    locale: 'pt_BR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
        <Analytics />
      </body>
    </html>
  )
}
