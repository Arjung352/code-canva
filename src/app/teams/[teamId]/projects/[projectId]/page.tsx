"use client";

/**
 * /teams/[teamId]/projects/[projectId]
 * Project dashboard — shows members panel, basic project info, and quick links.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Loader2, Settings, Code2, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProjectMembersPanel } from "@/components/project/project-members-panel";
import { useToast } from "@/hooks/use-toast";
import type { ProjectRole } from "@/lib/permissions";

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isArchived: boolean;
  teamId: string;
  team: { id: string; name: string; slug: string };
  createdBy: { id: string; username: string; avatarUrl: string | null };
  _count: { members: number; documents: number; meetings: number };
}

export default function ProjectDashboardPage() {
  const { teamId, projectId } = useParams<{
    teamId: string;
    projectId: string;
  }>();
  const { user } = useUser();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [myRole, setMyRole] = useState<ProjectRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = (await res.json()) as {
          project: ProjectDetail;
          myRole: ProjectRole;
        };
        setProject(data.project);
        setMyRole(data.myRole);
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load project.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) fetchProject();
  }, [projectId, toast]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project || !myRole) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Project not found or access denied.
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/teams/${teamId}`} className="hover:underline">
          {project.team.name}
        </Link>
        <span>/</span>
        <Link href={`/teams/${teamId}/projects`} className="hover:underline">
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant="secondary">{myRole.replace("_", " ")}</Badge>
            {project.isArchived && (
              <Badge variant="outline" className="text-muted-foreground">
                Archived
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Link href={`/teams/${teamId}/projects/${projectId}/canvas`}>
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-medium">Open Canvas</span>
            <span className="text-xs text-muted-foreground">
              Collaborative code editor
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Link href={`/teams/${teamId}/projects/${projectId}/canvas`}>
            <Video className="h-6 w-6 text-emerald-500" />
            <span className="font-medium">Video Meeting</span>
            <span className="text-xs text-muted-foreground">
              LiveKit audio & video conferencing
            </span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          disabled
        >
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
          <span className="font-medium">Project Chat</span>
          <span className="text-xs text-muted-foreground">Coming in Phase 4</span>
        </Button>
      </div>

      <Separator />

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Members</CardTitle>
          {myRole === "PROJECT_LEAD" && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/teams/${teamId}/projects/${projectId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ProjectMembersPanel
            projectId={projectId}
            currentUserRole={myRole}
            currentUserId={user?.id ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
