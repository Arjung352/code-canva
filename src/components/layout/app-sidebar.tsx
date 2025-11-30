import Link from 'next/link';
import {
  FileCode,
  Github,
  PlusCircle,
  FolderGit2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarFooter } from '../ui/sidebar';
import UserNav from './user-nav';
import { ThemeToggle } from '../theme-toggle';


const files = [
  { name: 'app.tsx', icon: FileCode },
  { name: 'index.css', icon: "📄" },
  { name: 'package.json', icon: "📦" },
];

const users = [
  { name: 'Alice', avatar: 'https://picsum.photos/seed/2/40/40' },
  { name: 'Bob', avatar: 'https://picsum.photos/seed/3/40/40' },
  { name: 'Charlie', avatar: 'https://picsum.photos/seed/4/40/40' },
];


export default function AppSidebar() {

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              Files
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <FolderGit2 />
                src
              </SidebarMenuButton>
            </SidebarMenuItem>
             <div className="pl-4">
                {files.map((file) => (
                    <SidebarMenuItem key={file.name}>
                        <SidebarMenuButton>
                            {typeof file.icon === 'string' ? <span>{file.icon}</span> : <file.icon />}
                            {file.name}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
             </div>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Collaborators</SidebarGroupLabel>
            {users.map((user, index) => (
                 <SidebarMenuItem key={index}>
                    <SidebarMenuButton>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} data-ai-hint="person portrait" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className='flex-col gap-4'>
        <div className="flex items-center gap-2">
            <UserNav />
            <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
