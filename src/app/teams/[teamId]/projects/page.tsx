"use client";

/**
 * /teams/[teamId]/projects
 * Lists all projects belonging to a team.
 * Only OWNER and ADMIN can see the Create Project option.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, FolderPlus, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/project-card";
import { useToast } from "@/hooks/use-toast";

interface ProjectWithMeta {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  teamId: string;
  isArchived: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    members: number;
    documents: number;
    meetings: number;
  };
  myRole: string;
}

export default function TeamProjectsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`/api/teams/${teamId}/projects`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        console.log(data);
        if (data.projects) {
          setProjects(data.projects);
          setCurrentRole(data.currentRole ?? null);
        } else if (Array.isArray(data)) {
          setProjects(data);
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load projects.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (teamId) fetchProjects();
  }, [teamId, toast]);

  const canCreateProject = currentRole === "OWNER" || currentRole === "ADMIN";

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between my-8">
        <div className="flex flex-col">
          <Link
            href={`/teams/${teamId}`}
            className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <h1 className="text-3xl font-bold">
              Team <span className="text-primary">Projects</span>
            </h1>
            {currentRole && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary border text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" />
                {currentRole}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Select a project to open its canvas and collaborate.
          </p>
        </div>

        {/* Create Project button: only visible to OWNER and ADMIN */}
        {canCreateProject && (
          <Button asChild>
            <Link href={`/teams/${teamId}/projects/new`}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {canCreateProject
              ? "Create your first project to start collaborating with your team."
              : "No projects have been created yet. Contact a team owner or admin to create one."}
          </p>
          {canCreateProject && (
            <Button asChild>
              <Link href={`/teams/${teamId}/projects/new`}>
                Create a Project
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
