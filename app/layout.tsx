import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PJe Checklist Generator',
  description: 'Gerador de checklist para versões PJe',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
