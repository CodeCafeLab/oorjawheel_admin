'use client'

import { Toaster } from '@/components/ui/toaster'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { usePathname } from 'next/navigation'

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full min-h-screen">
        <Header />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
