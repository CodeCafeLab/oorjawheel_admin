
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Smartphone,
  FileText,
  History,
  BarChart3,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const OorjaLogo = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M50 0C22.38 0 0 22.38 0 50C0 77.62 22.38 100 50 100C77.62 100 100 77.62 100 50C100 22.38 77.62 0 50 0ZM50 88C29.01 88 12 70.99 12 50C12 29.01 29.01 12 50 12C70.99 12 88 29.01 88 50C88 70.99 70.99 88 50 88Z"
        fill="currentColor"
      />
      <path
        d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50C75 36.2 63.8 25 50 25ZM50 63C42.82 63 37 57.18 37 50C37 42.82 42.82 37 50 37C57.18 37 63 42.82 63 50C63 57.18 57.18 63 50 63Z"
        fill="currentColor"
      />
    </svg>
  )

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/devices', label: 'Devices' },
  { href: '/cms', label: 'Content CMS' },
  { href: '/logs', label: 'Logs' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/super-login', label: 'Super Login' },
  { href: '/settings', label: 'Settings' },
]

const icons: { [key: string]: React.ElementType } = {
    Dashboard: LayoutDashboard,
    Users: Users,
    Devices: Smartphone,
    'Content CMS': FileText,
    Logs: History,
    Analytics: BarChart3,
    'Super Login': KeyRound,
    Settings: Settings,
}


export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2.5">
          <OorjaLogo />
          <h1 className="text-xl font-headline font-semibold text-primary-foreground">Oorja Admin</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = icons[item.label]
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LogOut />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
