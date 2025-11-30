import Link from 'next/link';
import {
  File,
  Folder,
  Settings,
  Users,
  LifeBuoy,
  FileCode,
  Github,
  PlusCircle,
  FolderGit2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';
import placeholderImages from '@/lib/placeholder-images.json';

const files = [
  { name: 'app.tsx', icon: FileCode },
  { name: 'index.css', icon: File },
  { name: 'package.json', icon: File },
];

const users = [
  { name: 'Alice', avatar: 'https://picsum.photos/seed/2/40/40' },
  { name: 'Bob', avatar: 'https://picsum.photos/seed/3/40/40' },
  { name: 'Charlie', avatar: 'https://picsum.photos/seed/4/40/40' },
];

const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1');


export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const sidebarContent = (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Logo />
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Files</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
          >
            <FolderGit2 className="h-4 w-4" />
            src
          </Link>
          <div className="pl-4">
            {files.map((file) => (
              <Link
                key={file.name}
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <file.icon className="h-4 w-4" />
                {file.name}
              </Link>
            ))}
          </div>
        </nav>
        <div className="mt-6 px-2 lg:px-4">
            <span className="font-semibold text-muted-foreground">Collaborators</span>
            <div className="mt-2 space-y-2">
                {users.map((user, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} data-ai-hint="person portrait" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
        <nav className="grid gap-1">
          <Button variant="ghost" className="justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="justify-start">
            <LifeBuoy className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </nav>
      </div>
    </div>
  );

  return (
    <aside className={cn(
      "hidden border-r bg-card text-card-foreground sm:block",
      isMobile && "block w-full border-r-0"
    )}>
      {sidebarContent}
    </aside>
  );
}
