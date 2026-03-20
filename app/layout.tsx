import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'WOS 2.0',
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
      {/* Script anti-flash: aplica la clase dark antes de que React hidrate */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('wos-theme');if(t==='dark'||!t)document.documentElement.classList.add('dark');})()` }} />
      </head>
      <body className="bg-wos-bg text-wos-text">
        <ThemeProvider>
          <SidebarProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}