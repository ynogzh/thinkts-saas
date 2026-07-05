import { useLayout } from '@/context/layout-provider'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useMenus } from '@/hooks/use-menus'
import type { MenuNode } from '@/lib/admin-api'
import { sidebarData } from './data/sidebar-data'
import * as LucideIcons from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const iconMap: Record<string, React.ElementType> = {
  Building: LucideIcons.Building,
  Users: LucideIcons.Users,
  Shield: LucideIcons.Shield,
  ShoppingCart: LucideIcons.ShoppingCart,
  CreditCard: LucideIcons.CreditCard,
  Megaphone: LucideIcons.Megaphone,
  FileText: LucideIcons.FileText,
  Settings: LucideIcons.Settings,
  Table: LucideIcons.Table,
  Folder: LucideIcons.Folder,
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Package: LucideIcons.Package,
}

function menuNodesToNavGroups(menus: MenuNode[]) {
  return menus.map((node) => {
    const icon = iconMap[node.icon] ?? iconMap.Folder
    if (node.children?.length) {
      return {
        title: node.label,
        items: node.children.map((child) => ({
          title: child.label,
          url: `/resources/${child.key.replace('/resources/', '')}`,
          icon: iconMap.Table,
        })),
      }
    }
    return {
      title: node.label,
      items: [{
        title: node.label,
        url: node.key.startsWith('/') ? node.key : `/${node.key}`,
        icon,
      }],
    }
  })
}

function SidebarSkeleton() {
  return (
    <div className='space-y-2 px-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className='h-8 w-full' />
      ))}
    </div>
  )
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { data: menus, isLoading, isError } = useMenus()

  const navGroups = menus ? menuNodesToNavGroups(menus) : sidebarData.navGroups

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? <SidebarSkeleton /> : isError ? (
          <div className='px-4 py-2 text-sm text-muted-foreground'>Failed to load menus</div>
        ) : (
          navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
