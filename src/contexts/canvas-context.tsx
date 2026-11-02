"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ProjectRole } from "@/lib/permissions";
import type { Collaborator } from "@/hooks/use-yjs-document";

export interface CanvasDocumentMeta {
  id: string;
  name: string;
  filePath: string;
  language: string;
  lastEditedById?: string | null;
  updatedAt: string;
}

export interface CanvasProjectMember {
  id: string;
  role: ProjectRole;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface CanvasContextValue {
  teamId: string;
  projectId: string;
  currentUserRole: ProjectRole | null;
  isRoleLoading: boolean;

  documents: CanvasDocumentMeta[];
  isLoadingDocs: boolean;
  activeDocId: string | null;
  setActiveDocId: React.Dispatch<React.SetStateAction<string | null>>;
  refreshDocuments: () => Promise<void>;

  members: CanvasProjectMember[];
  isLoadingMembers: boolean;
  refreshMembers: () => Promise<void>;

  collaborators: Collaborator[];
  setCollaborators: (collabs: Collaborator[]) => void;

  isCreateFileOpen: boolean;
  setIsCreateFileOpen: (open: boolean) => void;

  // Active meeting state (for Phase 3 video conferencing overlay/panel)
  isMeetingActive: boolean;
  setIsMeetingActive: (active: boolean) => void;
  activeMeetingId: string | null;
  setActiveMeetingId: React.Dispatch<React.SetStateAction<string | null>>;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({
  teamId,
  projectId,
  currentUserRole,
  isRoleLoading = false,
  children,
}: {
  teamId: string;
  projectId: string;
  currentUserRole: ProjectRole | null;
  isRoleLoading?: boolean;
  children: React.ReactNode;
}) {
  const [documents, setDocuments] = useState<CanvasDocumentMeta[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const [members, setMembers] = useState<CanvasProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [collaborators, setCollaboratorsState] = useState<Collaborator[]>([]);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);

  // Meeting states
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);

  // Stable document fetcher
  const refreshDocuments = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (res.ok) {
        const data = (await res.json()) as CanvasDocumentMeta[];
        setDocuments(data);
        setActiveDocId((prev) => prev || (data.length > 0 ? data[0].id : null));
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [projectId]);

  // Stable members fetcher
  const refreshMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = (await res.json()) as CanvasProjectMember[];
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to load project members", err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [projectId]);

  // Stable collaborator setter with deep equality check to prevent infinite re-render cycles
  const setCollaborators = useCallback((next: Collaborator[]) => {
    setCollaboratorsState((prev) => {
      if (
        prev.length === next.length &&
        prev.every(
          (p, i) =>
            p.clientId === next[i]?.clientId &&
            p.user?.id === next[i]?.user?.id &&
            p.user?.name === next[i]?.user?.name,
        )
      ) {
        return prev; // Preserve identity to prevent child re-renders
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (projectId) {
      refreshDocuments();
      refreshMembers();
    }
  }, [projectId, refreshDocuments, refreshMembers]);

  return (
    <CanvasContext.Provider
      value={{
        teamId,
        projectId,
        currentUserRole,
        isRoleLoading,
        documents,
        isLoadingDocs,
        activeDocId,
        setActiveDocId,
        refreshDocuments,
        members,
        isLoadingMembers,
        refreshMembers,
        collaborators,
        setCollaborators,
        isCreateFileOpen,
        setIsCreateFileOpen,
        isMeetingActive,
        setIsMeetingActive,
        activeMeetingId,
        setActiveMeetingId,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return ctx;
}
