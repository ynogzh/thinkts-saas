import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

type HeaderProps = {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('border-b', className)}>
      <div className='flex h-16 items-center px-4'>
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
      </div>
    </header>
  )
}
