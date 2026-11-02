"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  FileCode,
  Plus,
  ArrowLeft,
  Loader2,
  FolderOpen,
  Eye,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useProjectRole } from "@/hooks/use-project-role";
import { hasProjectPermission } from "@/lib/permissions";

interface DocumentMeta {
  id: string;
  name: string;
  filePath: string;
  language: string;
  lastEditedById?: string | null;
  updatedAt: string;
}

interface ActiveDocumentData {
  id: string;
  name: string;
  filePath: string;
  language: string;
  ydocState?: string | null;
  content?: string;
}

const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: `// CodeCanvas Collaborative Workspace
console.log("Welcome to CodeCanvas!");

function calculateMetrics(items) {
  return items.reduce((acc, curr) => acc + curr, 0);
}
`,
  typescript: `// CodeCanvas TypeScript Workspace
interface Collaborator {
  id: string;
  name: string;
  active: boolean;
}

const team: Collaborator[] = [
  { id: "1", name: "Alice", active: true },
];

console.log("Initialized team workspace:", team);
`,
  python: `# CodeCanvas Python Workspace
def greet(name: str) -> str:
    message = f"Hello from CodeCanvas, {name}!"
    print(message)
    return message

greet("Developer")
`,
};

export default function ProjectCanvasPage() {
  const { teamId, projectId } = useParams<{
    teamId: string;
    projectId: string;
  }>();
  const { user } = useUser();
  const { role, isLoading: isRoleLoading } = useProjectRole(projectId);
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeDocData, setActiveDocData] = useState<ActiveDocumentData | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingActiveDoc, setIsLoadingActiveDoc] = useState(false);

  // New Document Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileLang, setNewFileLang] = useState("typescript");
  const [isCreating, setIsCreating] = useState(false);

  const canEdit = role ? hasProjectPermission(role, "EDIT_DOCUMENT") : false;

  // Fetch documents for this project
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      const docs = (await res.json()) as DocumentMeta[];
      setDocuments(docs);

      if (docs.length > 0 && !activeDocId) {
        setActiveDocId(docs[0].id);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project documents",
      });
    } finally {
      setIsLoadingDocs(false);
    }
  }, [projectId, activeDocId, toast]);

  useEffect(() => {
    if (projectId) fetchDocuments();
  }, [projectId, fetchDocuments]);

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
      const filePath = newFileName.startsWith("/") ? newFileName : `/${newFileName}`;
      const defaultContent = DEFAULT_SNIPPETS[newFileLang] || `// ${newFileName}\n`;

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
      setIsCreateOpen(false);
      setNewFileName("");
      setDocuments((prev) => [...prev, json]);
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
              initialContent: DEFAULT_SNIPPETS.typescript,
            }),
          });
          if (res.ok) {
            const doc = await res.json();
            setDocuments([doc]);
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
  }, [isLoadingDocs, documents.length, canEdit, projectId, isCreating]);

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
          {role && (
            <Badge variant="outline" className="text-[11px] gap-1 py-0">
              <Shield className="h-3 w-3 text-primary" />
              {role.replace("_", " ")}
            </Badge>
          )}
        </div>

        {/* New File Button (Only if user has EDIT_DOCUMENT permission) */}
        {canEdit && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                New File
              </Button>
            </DialogTrigger>
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
                    placeholder="e.g. app.tsx or utils.py"
                    value={newFileName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewFileName(val);
                      if (val.endsWith(".py")) setNewFileLang("python");
                      else if (val.endsWith(".ts") || val.endsWith(".tsx")) setNewFileLang("typescript");
                      else if (val.endsWith(".js") || val.endsWith(".jsx")) setNewFileLang("javascript");
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
        )}
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
            currentUser={
              user
                ? {
                    id: user.id,
                    username: user.username || user.firstName || "Collaborator",
                    avatarUrl: user.imageUrl,
                  }
                : null
            }
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center border rounded-xl bg-card p-6 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold">No Documents Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {canEdit
                ? "Create a new file using the button above to begin collaborative editing."
                : "This project has no documents yet. A developer or project lead can create one."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
