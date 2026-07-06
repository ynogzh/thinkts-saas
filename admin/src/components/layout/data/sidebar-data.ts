import {
  Building2, Command,
  LayoutDashboard, ListTodo, MessagesSquare, Package,
  Settings, ShieldCheck, Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: { name: 'Admin', email: 'admin@thinkts.local', avatar: '' },
  teams: [
    { name: 'ThinkTS SaaS', logo: Command, plan: 'Platform' },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: 'Tasks', url: '/tasks', icon: ListTodo },
        { title: 'Chats', url: '/chats', badge: '3', icon: MessagesSquare },
        { title: 'Users', url: '/users', icon: Users },
        {
          title: 'Resources',
          icon: Package,
          items: [
            { title: 'Tenants', url: '/resources/platform_tenant' },
            { title: 'Identity Users', url: '/resources/identity_user' },
            { title: 'Roles', url: '/resources/permission_role' },
            { title: 'Orders', url: '/resources/trade_order' },
            { title: 'Payments', url: '/resources/payment_channel' },
            { title: 'Articles', url: '/resources/content_article' },
          ],
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        { title: 'Profile', url: '/settings', icon: Settings },
        { title: 'Account', url: '/settings/account', icon: ShieldCheck },
        { title: 'Appearance', url: '/settings/appearance', icon: Building2 },
      ],
    },
  ],
}
