import Link from 'next/link';
import { PanelLeft, Code2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationCenter from '@/components/notifications/notification-center';
import UserNav from './user-nav';
import AppSidebar from './app-sidebar';
import { Logo } from '../logo';
import { ThemeToggle } from '../theme-toggle';
import { ArrowRight } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/canvas', label: 'Web Editor' },
    { href: '#', label: 'Compilers' },
    { href: '#', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-6">
                    <Logo />
                    <nav className="mt-8 flex flex-col space-y-4">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60">{link.label}</Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
                <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{link.label}</Link>
                    ))}
                </nav>
            </div>
            <nav className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" asChild className="hidden sm:inline-block">
                <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                <Link href="/login">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
            </nav>
        </div>
      </div>
    </header>
  );
}

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0">
          <AppSidebar isMobile />
        </SheetContent>
      </Sheet>
      
      <div className="hidden sm:block">
        <Logo className="text-xl" />
      </div>

      <div className="flex w-full items-center gap-4 md:ml-auto md:flex-none">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <ThemeToggle />
        <NotificationCenter />
        <UserNav />
      </div>
    </header>
  );
}
