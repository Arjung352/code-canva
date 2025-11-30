'use client';

import { Bell, UserPlus, GitCommit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const notifications = [
  {
    id: 1,
    type: 'join',
    user: 'Alice',
    avatar: 'https://picsum.photos/seed/2/40/40',
    details: 'joined the project.',
    time: '5m ago',
  },
  {
    id: 2,
    type: 'commit',
    user: 'You',
    avatar: 'https://picsum.photos/seed/1/40/40',
    details: 'pushed a new commit to main.',
    time: '1h ago',
  },
  {
    id: 3,
    type: 'join',
    user: 'Bob',
    avatar: 'https://picsum.photos/seed/3/40/40',
    details: 'joined the project.',
    time: '3h ago',
  },
];

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'join':
      return <UserPlus className="h-4 w-4 text-primary" />;
    case 'commit':
      return <GitCommit className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function NotificationCenter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-headline">Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flow-root">
              <ul role="list" className="divide-y divide-border">
                {notifications.map((notification) => (
                  <li key={notification.id} className="p-4 hover:bg-secondary">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatar} alt={notification.user} data-ai-hint="person portrait" />
                          <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-card p-0.5">
                          <NotificationIcon type={notification.type} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{notification.user}</span> {notification.details}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t p-2 text-center">
                <Button variant="link" size="sm" className="w-full">
                    View all notifications
                </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
