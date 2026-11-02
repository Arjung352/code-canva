"use client";

import Link from "next/link";
import { Folder, Users, FileCode, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface ProjectCardProps {
  project: {
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
  };
  myRole: string;
}

export function ProjectCard({ project, myRole }: ProjectCardProps) {
  return (
    <Card className="group flex flex-col border hover:border-primary/50 transition-colors duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
              <Folder className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">{project.slug}</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {myRole.replace("_", " ")}
          </Badge>
        </div>
        {project.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {project._count.members}
          </span>
          <span className="flex items-center gap-1">
            <FileCode className="h-3.5 w-3.5" />
            {project._count.documents}
          </span>
          <span className="flex items-center gap-1">
            <Video className="h-3.5 w-3.5" />
            {project._count.meetings}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" variant="outline" size="sm">
          <Link href={`/teams/${project.teamId}/projects/${project.id}`}>
            Open Project →
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

