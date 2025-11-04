import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import HeaderBar from '@/components/HeaderBar'
import SidebarOverlay from '@/components/SidebarOverlay'
import { SidebarProvider } from '@/contexts/SidebarContext'

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
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden relative">
            <Sidebar />
            
            {/* Overlay para móvil */}
            <SidebarOverlay />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <HeaderBar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
