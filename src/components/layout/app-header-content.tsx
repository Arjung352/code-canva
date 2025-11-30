'use client';

import { useSidebar } from '@/components/ui/sidebar';
import NotificationCenter from '@/components/notifications/notification-center';
import UserNav from './user-nav';
import { ThemeToggle } from '../theme-toggle';

export default function AppHeaderContent() {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
        <div className="flex w-full items-center justify-end gap-2">
            <ThemeToggle />
            <NotificationCenter />
            <UserNav />
        </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-4">
      <div className="ml-auto flex-1 sm:flex-initial" />
      <ThemeToggle />
      <NotificationCenter />
      <UserNav />
    </div>
  );
}
