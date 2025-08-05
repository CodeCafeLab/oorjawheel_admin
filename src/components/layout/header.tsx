
'use client'

import { Search, Bell } from 'lucide-react'
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

const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/users', label: 'Users' },
    { href: '/devices', label: 'Devices' },
    { href: '/cms', label: 'CMS Builder' },
    { href: '/logs', label: 'Logs' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/super-login', label: 'Super Login' },
    { href: '/settings', label: 'Settings' },
]

export function Header() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const currentPath = navItems.find(item => item.href !== '/' && pathname.startsWith(item.href));
    return currentPath ? currentPath.label : 'Dashboard';
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-8">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <h1 className="text-xl font-semibold hidden md:block flex-1">{getPageTitle()}</h1>
            <div className="ml-auto flex-1 sm:flex-initial max-w-xs">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    />
                </div>
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
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
  )
}
