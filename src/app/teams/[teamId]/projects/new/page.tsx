"use client";

/**
 * /teams/[teamId]/projects/new
 * Create a new project within a team.
 * Only accessible to OWNER and ADMIN members.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CreateProjectForm } from "@/components/project/create-project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      try {
        const res = await fetch(`/api/teams/${teamId}/members`);
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setCurrentRole(data.currentRole ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (teamId) checkPermission();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canCreate = currentRole === "OWNER" || currentRole === "ADMIN";

  if (!canCreate) {
    return (
      <div className="px-8 py-12 max-w-lg mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-10 w-10" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          Only team owners and admins can create new projects. You are currently a{" "}
          <span className="font-semibold text-foreground">{currentRole ?? "Member"}</span> in this team.
        </p>
        <Button asChild variant="outline">
          <Link href={`/teams/${teamId}/projects`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link
        href={`/teams/${teamId}/projects`}
        className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Project</CardTitle>
          <CardDescription>
            Projects are collaborative workspaces within your team. You will
            automatically become the Project Lead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProjectForm teamId={teamId} />
        </CardContent>
      </Card>
    </div>
  );
}
