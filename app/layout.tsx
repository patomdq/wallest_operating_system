import type { Metadata } from 'next'
import './globals.css'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { AuthProvider } from '@/contexts/AuthContext'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'WOS 1.0 - Wallest Operating System',
  description: 'Sistema operativo para gestión inmobiliaria integral',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-wos-bg text-wos-text">
        <AuthProvider>
          <SidebarProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
