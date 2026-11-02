import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

/**
 * Canvas layout for /teams/[teamId]/projects/[projectId]/canvas
 * Reuses the existing AppSidebar + SidebarProvider.
 * Phase 2 will extend this with a YjsProvider wrapping the entire layout.
 */
export default function ProjectCanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 bg-background p-4 sm:p-6 md:p-8 flex flex-col min-h-0">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

