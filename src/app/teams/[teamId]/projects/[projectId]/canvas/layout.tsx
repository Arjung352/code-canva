"use client";

import { useParams } from "next/navigation";
import { CanvasProvider } from "@/contexts/canvas-context";
import CanvasProjectSidebar from "@/components/layout/canvas-project-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useProjectRole } from "@/hooks/use-project-role";

export default function ProjectCanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { teamId, projectId } = useParams<{
    teamId: string;
    projectId: string;
  }>();

  const { role, isLoading: isRoleLoading } = useProjectRole(projectId);

  return (
    <CanvasProvider
      teamId={teamId}
      projectId={projectId}
      currentUserRole={role}
      isRoleLoading={isRoleLoading}
    >
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          <div className="flex flex-1">
            <CanvasProjectSidebar />
            <SidebarInset>
              <main className="flex-1 bg-background p-4 sm:p-6 md:p-8 flex flex-col min-h-0">
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </CanvasProvider>
  );
}
