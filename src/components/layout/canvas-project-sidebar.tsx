"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FileCode,
  FileText,
  FileJson,
  FolderGit2,
  Plus,
  ArrowLeft,
  Users,
  Circle,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "../logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
} from "../ui/sidebar";
import UserNav from "./user-nav";
import { ThemeToggle } from "../theme-toggle";
import { useCanvas } from "@/contexts/canvas-context";
import { hasProjectPermission } from "@/lib/permissions";

function getFileIcon(fileName: string, language: string) {
  const name = fileName.toLowerCase();
  if (name.endsWith(".ts") || name.endsWith(".tsx")) {
    return <FileCode className="h-4 w-4 text-blue-400 shrink-0" />;
  }
  if (name.endsWith(".js") || name.endsWith(".jsx")) {
    return <FileCode className="h-4 w-4 text-amber-400 shrink-0" />;
  }
  if (name.endsWith(".py")) {
    return <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />;
  }
  if (name.endsWith(".json")) {
    return <FileJson className="h-4 w-4 text-yellow-500 shrink-0" />;
  }
  if (name.endsWith(".html") || name.endsWith(".css")) {
    return <FileCode className="h-4 w-4 text-orange-400 shrink-0" />;
  }
  if (language === "typescript") return <FileCode className="h-4 w-4 text-blue-400 shrink-0" />;
  if (language === "javascript") return <FileCode className="h-4 w-4 text-amber-400 shrink-0" />;
  if (language === "python") return <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />;
  return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
}

export default function CanvasProjectSidebar() {
  const {
    teamId,
    projectId,
    currentUserRole,
    documents,
    isLoadingDocs,
    activeDocId,
    setActiveDocId,
    members,
    isLoadingMembers,
    collaborators,
    setIsCreateFileOpen,
  } = useCanvas();

  const canEdit = currentUserRole
    ? hasProjectPermission(currentUserRole, "EDIT_DOCUMENT")
    : false;

  // Active collaborator user IDs (from live Yjs awareness)
  const activeUserIds = useMemo(
    () => new Set(collaborators.map((c) => c.user.id).filter(Boolean)),
    [collaborators],
  );

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <Logo />
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/teams/${teamId}/projects/${projectId}`}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Project
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-0">
        {/* Files Section */}
        <SidebarGroup className="py-2 border-b">
          <SidebarGroupLabel className="flex items-center justify-between px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-primary" />
              Files ({documents.length})
            </span>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setIsCreateFileOpen(true)}
                title="Create new file"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </SidebarGroupLabel>

          <ScrollArea className="max-h-[38vh]">
            <SidebarMenu className="px-2 space-y-0.5">
              {isLoadingDocs ? (
                <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading files...
                </div>
              ) : documents.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No files yet
                </div>
              ) : (
                documents.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <SidebarMenuItem key={doc.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setActiveDocId(doc.id)}
                        className={`text-xs font-mono flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getFileIcon(doc.name, doc.language)}
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase shrink-0">
                          {doc.language.slice(0, 3)}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroup>

        {/* Project Members Section */}
        <SidebarGroup className="py-2 flex-1">
          <SidebarGroupLabel className="flex items-center justify-between px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Project Members ({members.length})
            </span>
          </SidebarGroupLabel>

          <ScrollArea className="max-h-[38vh]">
            <SidebarMenu className="px-2 space-y-1">
              {isLoadingMembers ? (
                <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No members
                </div>
              ) : (
                members.map((member) => {
                  const isOnline = activeUserIds.has(member.userId);

                  return (
                    <SidebarMenuItem key={member.id}>
                      <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 transition-colors text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative shrink-0">
                            <Avatar className="h-6 w-6">
                              {member.user.avatarUrl ? (
                                <AvatarImage
                                  src={member.user.avatarUrl}
                                  alt={member.user.username}
                                />
                              ) : null}
                              <AvatarFallback className="text-[10px]">
                                {member.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online / Offline status dot */}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${
                                isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                              }`}
                              title={isOnline ? "Online (editing)" : "Offline"}
                            />
                          </div>

                          <div className="truncate min-w-0">
                            <p className="text-xs font-medium truncate leading-tight">
                              {member.user.username}
                            </p>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Circle
                                className={`h-1.5 w-1.5 fill-current ${
                                  isOnline ? "text-emerald-500" : "text-muted-foreground/40"
                                }`}
                              />
                              {isOnline ? "Active" : "Offline"}
                            </span>
                          </div>
                        </div>

                        {/* Role badge */}
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 shrink-0 font-normal"
                        >
                          {member.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 flex-col gap-3">
        <div className="flex items-center justify-between">
          <UserNav />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
