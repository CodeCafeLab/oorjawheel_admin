
'use client'

import { Search, Bell, GitBranch, LineChart } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Settings,
  Smartphone,
  FileText,
  Terminal,
} from 'lucide-react'
import { logout } from '@/actions/auth'

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/users', label: 'User Management', icon: Users },
    { href: '/devices', label: 'Device Management', icon: Smartphone },
    { href: '/commands', label: 'Command Management', icon: Terminal },
    { href: '/cms', label: 'CMS', icon: FileText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/logs', label: 'Logs', icon: GitBranch },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]
  

export function Header() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const currentPath = navItems.find(item => item.href !== '/' && pathname.startsWith(item.href));
    return currentPath ? currentPath.label : 'Dashboard';
  }

  const handleLogout = async () => {
    await logout();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-8">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        
        <div className="flex w-full items-center gap-4">
            <h1 className="text-xl font-semibold hidden md:block flex-1">{getPageTitle()}</h1>
            <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-48 lg:w-72"
                    />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="person face" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/settings" passHref><DropdownMenuItem>Settings</DropdownMenuItem></Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </header>
  )
}
