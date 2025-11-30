import Link from 'next/link';
import { PanelLeft, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationCenter from '@/components/notifications/notification-center';
import UserNav from './user-nav';
import AppSidebar from './app-sidebar';
import { Logo } from '../logo';

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
        <NotificationCenter />
        <UserNav />
      </div>
    </header>
  );
}
