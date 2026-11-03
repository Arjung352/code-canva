"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export interface Collaborator {
  clientId: number;
  user: {
    id: string;
    name: string;
    color: string;
    avatarUrl?: string | null;
  };
}

const COLLABORATOR_COLORS = [
  "#2563eb", // blue
  "#7c3aed", // violet
  "#db2777", // pink
  "#ea580c", // orange
  "#16a34a", // green
  "#0891b2", // cyan
  "#d97706", // amber
  "#4f46e5", // indigo
];

function getRandomColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLLABORATOR_COLORS.length;
  return COLLABORATOR_COLORS[index];
}

interface UseYjsDocumentOptions {
  projectId: string;
  documentId: string;
  initialBase64State?: string | null;
  initialTextContent?: string;
  canEdit: boolean;
  currentUser?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  } | null;
}

export function useYjsDocument({
  projectId,
  documentId,
  initialBase64State,
  initialTextContent,
  canEdit,
  currentUser,
}: UseYjsDocumentOptions) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  // In-flight mutex & deduplication refs
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const lastSavedBase64Ref = useRef<string | null>(initialBase64State || null);
  const lastSavedContentRef = useRef<string | null>(initialTextContent || null);

  // Keep a stable ref for persistState to avoid tearing down the Yjs provider on callback changes
  const persistStateRef = useRef<(doc: Y.Doc) => Promise<void>>(async () => {});

  // Debounced save function to persist document state to PostgreSQL
  const persistState = useCallback(async (doc: Y.Doc) => {
    if (!canEdit) return;

    // Mutex check: if an autosave is already in-flight, queue a trailing save
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    const textContent = doc.getText("monaco").toString();
    const update = Y.encodeStateAsUpdate(doc);
    const base64Update = Buffer.from(update).toString("base64");

    // Deduplication check: if state is identical to last persisted state, avoid network request
    if (
      lastSavedBase64Ref.current === base64Update &&
      lastSavedContentRef.current === textContent
    ) {
      setSaveStatus("saved");
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const res = await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ydocState: base64Update,
          content: textContent,
        }),
      });

      if (res.ok) {
        lastSavedBase64Ref.current = base64Update;
        lastSavedContentRef.current = textContent;
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
      }
    } catch (e) {
      console.error("Failed to auto-save document state:", e);
      setSaveStatus("unsaved");
    } finally {
      isSavingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        persistState(doc);
      }
    }
  }, [projectId, documentId, canEdit]);

  useEffect(() => {
    persistStateRef.current = persistState;
  }, [persistState]);

  // Primary lifecycle: create Y.Doc and WebsocketProvider strictly based on documentId
  useEffect(() => {
    if (!documentId) return;

    const doc = new Y.Doc();
    ydocRef.current = doc;
    setYdoc(doc);

    // Apply initial state from database if available
    if (initialBase64State) {
      try {
        const binaryState = Uint8Array.from(atob(initialBase64State), (c) => c.charCodeAt(0));
        Y.applyUpdate(doc, binaryState);
      } catch (e) {
        console.error("Failed to load initial Yjs binary state:", e);
      }
    } else if (initialTextContent && doc.getText("monaco").length === 0) {
      doc.getText("monaco").insert(0, initialTextContent);
    }

    // Determine WebSocket server URL from environment or current hostname
    let wsUrl = process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL;
    if (!wsUrl && typeof window !== "undefined") {
      const isSecure = window.location.protocol === "https:";
      const protocol = isSecure ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.hostname || "localhost"}:1234`;
    } else if (!wsUrl) {
      wsUrl = "ws://localhost:1234";
    }

    // Guard against Mixed Content: in production HTTPS, upgrade ws:// to wss://
    if (typeof window !== "undefined" && window.location.protocol === "https:" && wsUrl.startsWith("ws://")) {
      wsUrl = wsUrl.replace(/^ws:\/\//i, "wss://");
    }

    const roomName = `doc-${documentId}`;
    let wsProvider: WebsocketProvider | null = null;

    try {
      wsProvider = new WebsocketProvider(wsUrl, roomName, doc, {
        connect: true,
      });

      setProvider(wsProvider);

      wsProvider.on("status", (event: { status: "connecting" | "connected" | "disconnected" }) => {
        setConnectionStatus(event.status);
      });

      // Synchronize initial connection status
      if (wsProvider.wsconnected) {
        setConnectionStatus("connected");
      } else if (wsProvider.wsconnecting) {
        setConnectionStatus("connecting");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (err) {
      console.error("Yjs WebSocket provider initialization error:", err);
      setConnectionStatus("disconnected");
    }

    // Auto-save on document update
    const updateHandler = (_update: Uint8Array, origin: unknown) => {
      // Avoid triggering an auto-save storm when remote updates are received via WebSocket
      if (wsProvider && origin === wsProvider) {
        return;
      }

      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        persistStateRef.current(doc);
      }, 2500);
    };

    doc.on("update", updateHandler);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save before tearing down
      persistStateRef.current(doc);

      doc.off("update", updateHandler);
      if (wsProvider) {
        wsProvider.destroy();
      }
      doc.destroy();
      setYdoc(null);
      setProvider(null);
    };
  }, [documentId]); // Only recreate when switching documents!

  // Dedicated Awareness & Collaborators sync effect (does NOT recreate the Y.Doc or WebsocketProvider)
  const userColor = useMemo(
    () => (currentUser?.id ? getRandomColor(currentUser.id) : "#2563eb"),
    [currentUser?.id],
  );

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    if (currentUser) {
      provider.awareness.setLocalStateField("user", {
        id: currentUser.id,
        name: currentUser.username,
        color: userColor,
        avatarUrl: currentUser.avatarUrl || null,
      });
    }

    const updateCollaborators = () => {
      const states = provider.awareness.getStates();
      const active: Collaborator[] = [];
      states.forEach((state, clientId) => {
        if (state.user) {
          active.push({
            clientId,
            user: state.user,
          });
        }
      });

      setCollaborators((prev) => {
        if (
          prev.length === active.length &&
          prev.every(
            (p, i) =>
              p.clientId === active[i]?.clientId &&
              p.user?.id === active[i]?.user?.id &&
              p.user?.name === active[i]?.user?.name,
          )
        ) {
          return prev; // Preserve identity to prevent child re-renders
        }
        return active;
      });
    };

    provider.awareness.on("change", updateCollaborators);
    updateCollaborators();

    return () => {
      provider.awareness.off("change", updateCollaborators);
    };
  }, [provider, currentUser?.id, currentUser?.username, currentUser?.avatarUrl, userColor]);

  const reconnect = useCallback(() => {
    if (provider) {
      setConnectionStatus("connecting");
      provider.disconnect();
      provider.connect();
    }
  }, [provider]);

  return {
    ydoc,
    provider,
    collaborators,
    saveStatus,
    connectionStatus,
    reconnect,
    persistNow: () => ydocRef.current && persistState(ydocRef.current),
  };
}
