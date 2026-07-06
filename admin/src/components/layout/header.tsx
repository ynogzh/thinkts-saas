import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        'z-50 h-16 border-b',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        className
      )}
      {...props}
    >
      <div className={cn(
        'flex h-full items-center justify-between px-4',
        fixed && 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      )}>
        <div className='flex items-center gap-3'>
          <SidebarTrigger variant='outline' className='max-md:scale-125' />
        </div>

        <div className='flex items-center gap-2'>
          {children}
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}
