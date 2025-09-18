
import type { Metadata } from 'next'
import './globals.css'
import RootClientLayout from './client-layout'

export const metadata: Metadata = {
  title: 'Oorja Admin',
  description: 'Admin panel for Oorja Wheel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Forum&family=Questrial&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  )
}
