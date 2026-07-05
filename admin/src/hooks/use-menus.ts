import { useQuery } from '@tanstack/react-query'
import { fetchMenus, type MenuNode } from '@/lib/admin-api'

export function useMenus() {
  return useQuery<MenuNode[]>({
    queryKey: ['menus'],
    queryFn: fetchMenus,
    staleTime: 5 * 60 * 1000,
  })
}
