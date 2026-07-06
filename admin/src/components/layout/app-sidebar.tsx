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
import { RESOURCE_CATALOG } from '@/lib/resource-catalog'
import * as LucideIcons from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const ICON_MAP: Record<string, React.ElementType> = {
  Building: LucideIcons.Building,
  Building2: LucideIcons.Building2,
  Users: LucideIcons.Users,
  Shield: LucideIcons.Shield,
  ShieldCheck: LucideIcons.ShieldCheck,
  ShoppingCart: LucideIcons.ShoppingCart,
  CreditCard: LucideIcons.CreditCard,
  Megaphone: LucideIcons.Megaphone,
  FileText: LucideIcons.FileText,
  Settings: LucideIcons.Settings,
  Table: LucideIcons.Table,
  Folder: LucideIcons.Folder,
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Package: LucideIcons.Package,
  Menu: LucideIcons.Menu,
  Filter: LucideIcons.Filter,
  Database: LucideIcons.Database,
  UserCheck: LucideIcons.UserCheck,
  List: LucideIcons.List,
  Receipt: LucideIcons.Receipt,
  Undo2: LucideIcons.Undo2,
  Wallet: LucideIcons.Wallet,
  Webhook: LucideIcons.Webhook,
  Ticket: LucideIcons.Ticket,
  TicketCheck: LucideIcons.TicketCheck,
  ClipboardList: LucideIcons.ClipboardList,
  Percent: LucideIcons.Percent,
  DollarSign: LucideIcons.DollarSign,
  UserPlus: LucideIcons.UserPlus,
  Share2: LucideIcons.Share2,
  FolderTree: LucideIcons.FolderTree,
  Cpu: LucideIcons.Cpu,
  Tags: LucideIcons.Tags,
  Smartphone: LucideIcons.Smartphone,
  Barcode: LucideIcons.Barcode,
  FileBadge: LucideIcons.FileBadge,
  Activity: LucideIcons.Activity,
  Terminal: LucideIcons.Terminal,
  MapPin: LucideIcons.MapPin,
  Store: LucideIcons.Store,
  Award: LucideIcons.Award,
  PackageCheck: LucideIcons.PackageCheck,
  FileCode: LucideIcons.FileCode,
  Zap: LucideIcons.Zap,
  Split: LucideIcons.Split,
  MessageCircle: LucideIcons.MessageCircle,
  ShoppingBag: LucideIcons.ShoppingBag,
  Blocks: LucideIcons.Blocks,
}

/** Map a resource key to its icon. */
function resourceIcon(key: string): string {
  const name = key.replace(/^\/resources\//, '')
  return RESOURCE_CATALOG[name]?.icon ?? 'Table'
}


function menuNodesToNavGroups(menus: MenuNode[]) {
  return menus.map((node) => {
    const groupIcon = ICON_MAP[node.icon] ?? ICON_MAP.Folder
    if (node.children?.length) {
      return {
        title: node.label,
        icon: groupIcon,
        items: node.children.map((child) => ({
          title: child.label,
          url: `/resources/${child.key.replace('/resources/', '')}`,
          icon: ICON_MAP[resourceIcon(child.key)] ?? ICON_MAP.Table,
        })),
      }
    }
    return {
      title: node.label,
      icon: groupIcon,
      items: [{
        title: node.label,
        url: node.key.startsWith('/') ? node.key : `/${node.key}`,
        icon: groupIcon,
      }],
    }
  })
}

function SidebarSkeleton() {
  return (
    <div className="space-y-2 px-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
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
        {isLoading ? (
          <SidebarSkeleton />
        ) : isError ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Failed to load menus
          </div>
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
