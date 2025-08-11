
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Smartphone,
  FileText,
  Terminal,
  Bell,
  ChevronDown,
  LineChart,
  GitBranch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/users', label: 'User Management', icon: Users },
    {
      href: '/devices',
      label: 'Device Management',
      icon: Smartphone,
      items: [
        { href: '/devices#master', label: 'Device Master' },
        { href: '/devices#devices', label: 'Devices' },
      ],
    },
    { href: '/commands', label: 'Command Management', icon: Terminal },
    {
      href: '/cms',
      label: 'CMS',
      icon: FileText,
      items: [
          {
              label: 'Web',
              items: [
                  { href: '/cms#privacy', label: 'Privacy Policy' },
                  { href: '/cms#terms', label: 'Terms & Conditions' },
                  { href: '/cms#shipping', label: 'Shipping & Returns' },
                  { href: '/cms#payment', label: 'Payment Terms' },
              ]
          },
          { href: '/cms#app', label: 'App' }
      ],
    },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/logs', label: 'Logs', icon: GitBranch },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]


const NavItem = ({ item }: { item: any }) => {
    const pathname = usePathname()
    const { state } = useSidebar();
    const [isOpen, setIsOpen] = React.useState(false);

    const isActive = (href: string) => {
        if (!href) return false;
        // Ignore hash for base path matching
        const baseHref = href.split('#')[0];
        return pathname === baseHref;
    }

    // Check if any sub-item is active
    const isSubActive = React.useMemo(() => {
        if (!item.items) return false;
        const checkActive = (items: any[]): boolean => {
            return items.some(subItem => {
                if (subItem.href && isActive(subItem.href)) {
                    return true;
                }
                if (subItem.items) {
                    return checkActive(subItem.items);
                }
                return false;
            });
        };
        // Also check the main href of the collapsible item itself
        return (item.href && isActive(item.href)) || checkActive(item.items);
    }, [item.items, item.href, pathname]);

    React.useEffect(() => {
        if (isSubActive) {
            setIsOpen(true);
        }
    }, [isSubActive]);

    if (!item.items) {
      return (
        <SidebarMenuItem>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={isActive(item.href)}
              tooltip={{ children: item.label, side: 'right' }}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
                 <Link href={item.href || '#'} passHref>
                    <SidebarMenuButton
                        isActive={isSubActive}
                        className="w-full justify-between"
                        tooltip={{ children: item.label, side: 'right' }}
                    >
                        <div className="flex items-center gap-2">
                            <item.icon />
                            <span className={state === 'collapsed' ? 'hidden' : 'inline'}>{item.label}</span>
                        </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""} ${state === 'collapsed' ? 'hidden' : 'inline'}`} />
                    </SidebarMenuButton>
                 </Link>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenuSub>
                    {item.items.map((subItem: any, index: number) => (
                        <SidebarMenuSubItem key={index}>
                            {subItem.items ? (
                                <>
                                 <h4 className="font-semibold text-xs text-muted-foreground my-2 ml-2">{subItem.label}</h4>
                                 <ul className="flex flex-col gap-1 ml-4">
                                 {subItem.items.map((nestedItem: any, nestedIndex: number) => (
                                     <li key={nestedIndex}>
                                        <SidebarMenuSubButton asChild isActive={pathname === nestedItem.href.split('#')[0]}>
                                            <Link href={nestedItem.href} passHref>
                                                <span>{nestedItem.label}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                     </li>
                                 ))}
                                 </ul>
                                </>
                            ) : (
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href.split('#')[0]}>
                                    <Link href={subItem.href} passHref>
                                        <span>{subItem.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            )}
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
      </Collapsible>
    )
  }

export function AppSidebar() {
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
          {navItems.map((item, index) => <NavItem key={index} item={item} />)}
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
