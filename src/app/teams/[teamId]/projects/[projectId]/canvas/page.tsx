"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  FileCode,
  Plus,
  ArrowLeft,
  Loader2,
  FolderOpen,
  Shield,
  Video,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CollaborativeEditor } from "@/components/collaboration/collaborative-editor";
import { VideoConferencePanel } from "@/components/meeting/video-conference-panel";
import { useCanvas } from "@/contexts/canvas-context";
import { hasProjectPermission } from "@/lib/permissions";
import { DEFAULT_SNIPPETS } from "@/lib/code-snippets";

interface ActiveDocumentData {
  id: string;
  name: string;
  filePath: string;
  language: string;
  ydocState?: string | null;
  content?: string;
}

interface ProjectMeeting {
  id: string;
  title: string;
  roomName: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  startedById: string;
}

export default function ProjectCanvasPage() {
  const {
    teamId,
    projectId,
    currentUserRole,
    isRoleLoading,
    documents,
    isLoadingDocs,
    activeDocId,
    setActiveDocId,
    refreshDocuments,
    setCollaborators,
    isCreateFileOpen,
    setIsCreateFileOpen,
    isMeetingActive,
    setIsMeetingActive,
    activeMeetingId,
    setActiveMeetingId,
  } = useCanvas();

  const { user } = useUser();
  const { toast } = useToast();

  const [activeDocData, setActiveDocData] = useState<ActiveDocumentData | null>(
    null,
  );
  const [isLoadingActiveDoc, setIsLoadingActiveDoc] = useState(false);

  // New Document Dialog inputs
  const [newFileName, setNewFileName] = useState("");
  const [newFileLang, setNewFileLang] = useState("typescript");
  const [isCreating, setIsCreating] = useState(false);

  // Live meeting indicator
  const [liveMeeting, setLiveMeeting] = useState<ProjectMeeting | null>(null);
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);

  // Memoize current user to guarantee stable reference across renders
  const currentUserData = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username || user.firstName || "Collaborator",
      avatarUrl: user.imageUrl || null,
    };
  }, [user?.id, user?.username, user?.firstName, user?.imageUrl]);

  const canEdit = currentUserRole
    ? hasProjectPermission(currentUserRole, "EDIT_DOCUMENT")
    : false;

  const canStartMeeting = currentUserRole
    ? hasProjectPermission(currentUserRole, "START_MEETING")
    : false;

  // Poll or check for live meeting in this project
  const checkLiveMeeting = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/meetings`);
      if (res.ok) {
        const meetings = (await res.json()) as ProjectMeeting[];
        const currentLive = meetings.find((m) => m.status === "LIVE");
        setLiveMeeting(currentLive || null);
        if (currentLive) {
          setActiveMeetingId((prev) => prev || currentLive.id);
        }
      }
    } catch {
      // Silently ignore background polling error
    }
  }, [projectId, setActiveMeetingId]);

  useEffect(() => {
    checkLiveMeeting();
    const interval = setInterval(checkLiveMeeting, 10000);
    return () => clearInterval(interval);
  }, [checkLiveMeeting]);

  // Load selected document detail & state
  useEffect(() => {
    if (!activeDocId) return;

    let cancelled = false;
    setIsLoadingActiveDoc(true);

    fetch(`/api/projects/${projectId}/documents/${activeDocId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load document");
        const json = await res.json();
        if (!cancelled && json.document) {
          setActiveDocData(json.document);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load document content",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingActiveDoc(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, activeDocId, toast]);

  // Create document handler
  const handleCreateDocument = async () => {
    if (!newFileName.trim()) {
      toast({ variant: "destructive", title: "File name is required" });
      return;
    }

    setIsCreating(true);
    try {
      const filePath = newFileName.startsWith("/")
        ? newFileName
        : `/${newFileName}`;
      const defaultContent =
        DEFAULT_SNIPPETS[newFileLang] || `// ${newFileName}\n`;

      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFileName,
          filePath,
          language: newFileLang,
          initialContent: defaultContent,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Failed to create file",
          description: json.error || "An error occurred",
        });
        return;
      }

      toast({ title: `File ${newFileName} created` });
      setIsCreateFileOpen(false);
      setNewFileName("");
      await refreshDocuments();
      setActiveDocId(json.id);
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    } finally {
      setIsCreating(false);
    }
  };

  // If project has 0 documents and user has edit rights, auto-initialize index.ts
  useEffect(() => {
    if (!isLoadingDocs && documents.length === 0 && canEdit && !isCreating) {
      const initDefault = async () => {
        setIsCreating(true);
        try {
          const res = await fetch(`/api/projects/${projectId}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "index.ts",
              filePath: "/index.ts",
              language: "typescript",
              initialContent: DEFAULT_SNIPPETS["typescript"],
            }),
          });
          if (res.ok) {
            const doc = await res.json();
            await refreshDocuments();
            setActiveDocId(doc.id);
          }
        } catch (e) {
          console.error("Auto-init file failed:", e);
        } finally {
          setIsCreating(false);
        }
      };
      initDefault();
    }
  }, [
    isLoadingDocs,
    documents.length,
    canEdit,
    projectId,
    isCreating,
    refreshDocuments,
    setActiveDocId,
  ]);

  // Video Conference handler: Start or Join
  const handleToggleMeeting = async () => {
    if (isMeetingActive) {
      setIsMeetingActive(false);
      return;
    }

    if (liveMeeting) {
      setActiveMeetingId(liveMeeting.id);
      setIsMeetingActive(true);
      return;
    }

    if (!canStartMeeting) {
      toast({
        variant: "destructive",
        title: "No Active Meeting",
        description: "Only a Developer or Project Lead can start a new meeting.",
      });
      return;
    }

    setIsStartingMeeting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Project Sync" }),
      });
      const meeting = await res.json();
      if (!res.ok) {
        throw new Error(meeting.error || "Failed to start meeting");
      }
      setLiveMeeting(meeting);
      setActiveMeetingId(meeting.id);
      setIsMeetingActive(true);
      toast({ title: "Meeting started" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error starting meeting";
      toast({
        variant: "destructive",
        title: "Could not start meeting",
        description: msg,
      });
    } finally {
      setIsStartingMeeting(false);
    }
  };

  if (isLoadingDocs || isRoleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-1 border-b">
        <div className="flex items-center gap-3">
          <Link
            href={`/teams/${teamId}/projects/${projectId}`}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Project
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs font-semibold">Collaborative Canvas</span>
          {currentUserRole && (
            <Badge variant="outline" className="text-[11px] gap-1 py-0">
              <Shield className="h-3 w-3 text-primary" />
              {currentUserRole.replace("_", " ")}
            </Badge>
          )}
        </div>

        {/* Right Action Buttons: Video Meeting & New File */}
        <div className="flex items-center gap-2">
          {/* Video Conference Toggle Button */}
          <Button
            size="sm"
            variant={liveMeeting || isMeetingActive ? "default" : "outline"}
            className={`h-7 text-xs gap-1.5 transition-all ${
              liveMeeting
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : ""
            }`}
            onClick={handleToggleMeeting}
            disabled={isStartingMeeting}
          >
            {isStartingMeeting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : liveMeeting ? (
              <Radio className="h-3.5 w-3.5 animate-pulse text-white" />
            ) : (
              <Video className="h-3.5 w-3.5 text-primary" />
            )}
            <span>
              {isMeetingActive
                ? "In Meeting"
                : liveMeeting
                ? "Join Live Meeting"
                : "Start Meeting"}
            </span>
          </Button>

          {/* New File Button */}
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setIsCreateFileOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New File
            </Button>
          )}
        </div>

        {/* Create Document Dialog */}
        <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Document</DialogTitle>
              <DialogDescription>
                Add a new collaborative file to this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">File Name</label>
                <Input
                  placeholder="e.g. app.tsx, utils.py, styles.css"
                  value={newFileName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewFileName(val);
                    if (val.endsWith(".py")) setNewFileLang("python");
                    else if (val.endsWith(".ts") || val.endsWith(".tsx"))
                      setNewFileLang("typescript");
                    else if (val.endsWith(".js") || val.endsWith(".jsx"))
                      setNewFileLang("javascript");
                    else if (val.endsWith(".json")) setNewFileLang("json");
                    else if (val.endsWith(".html")) setNewFileLang("html");
                    else if (val.endsWith(".css")) setNewFileLang("css");
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Language</label>
                <Select value={newFileLang} onValueChange={setNewFileLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="plaintext">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateDocument}
                disabled={isCreating}
                className="w-full mt-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create File"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document File Tabs */}
      {documents.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{doc.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Collaborative Editor Canvas */}
      <div className="flex-1 min-h-0 relative">
        {isLoadingActiveDoc ? (
          <div className="h-full flex items-center justify-center border rounded-xl bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeDocData ? (
          <CollaborativeEditor
            key={activeDocData.id}
            projectId={projectId}
            documentId={activeDocData.id}
            documentName={activeDocData.name}
            initialLanguage={activeDocData.language}
            initialBase64State={activeDocData.ydocState}
            initialContent={activeDocData.content}
            canEdit={canEdit}
            currentUser={currentUserData}
            onCollaboratorsChange={setCollaborators}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center border rounded-xl bg-card p-6 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold">No Documents Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {canEdit
                ? "Create a new file using the button above or sidebar to begin collaborative editing."
                : "This project has no documents yet. A developer or project lead can create one."}
            </p>
          </div>
        )}
      </div>

      {/* Independent Video Conference Panel (Phase 3) */}
      {isMeetingActive && activeMeetingId && (
        <VideoConferencePanel
          projectId={projectId}
          meetingId={activeMeetingId}
          currentUserRole={currentUserRole}
          isHost={liveMeeting?.startedById === user?.id}
          onClose={() => {
            setIsMeetingActive(false);
            checkLiveMeeting();
          }}
        />
      )}
    </div>
  );
}
