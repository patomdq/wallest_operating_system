import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SidebarProvider } from '@/contexts/SidebarContext'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'WOS 1.0 - Wallest Operating System',
  description: 'Sistema operativo para gestión inmobiliaria integral',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-wos-bg text-wos-text">
        <SidebarProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SidebarProvider>
      </body>
    </html>
  )
}
