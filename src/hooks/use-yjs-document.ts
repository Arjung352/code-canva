"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  // Debounced save function to persist document state to PostgreSQL
  const persistState = useCallback(async (doc: Y.Doc) => {
    if (!canEdit) return;
    setSaveStatus("saving");
    try {
      const update = Y.encodeStateAsUpdate(doc);
      const base64Update = Buffer.from(update).toString("base64");
      const textContent = doc.getText("monaco").toString();

      const res = await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ydocState: base64Update,
          content: textContent,
        }),
      });

      if (res.ok) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
      }
    } catch (e) {
      console.error("Failed to auto-save document state:", e);
      setSaveStatus("unsaved");
    }
  }, [projectId, documentId, canEdit]);

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

    // Determine WebSocket server URL
    const wsUrl =
      process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL ||
      (typeof window !== "undefined"
        ? `ws://${window.location.hostname}:1234`
        : "ws://localhost:1234");

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

      // Set user awareness state
      if (currentUser && wsProvider.awareness) {
        const userColor = getRandomColor(currentUser.id);
        wsProvider.awareness.setLocalStateField("user", {
          id: currentUser.id,
          name: currentUser.username,
          color: userColor,
          avatarUrl: currentUser.avatarUrl,
        });

        const updateCollaborators = () => {
          const states = wsProvider?.awareness.getStates();
          if (!states) return;
          const active: Collaborator[] = [];
          states.forEach((state, clientId) => {
            if (state.user) {
              active.push({
                clientId,
                user: state.user,
              });
            }
          });
          setCollaborators(active);
        };

        wsProvider.awareness.on("change", updateCollaborators);
        updateCollaborators();
      }
    } catch (err) {
      console.warn("Could not connect to Yjs WebSocket server. Operating in local-sync mode.", err);
      setConnectionStatus("disconnected");
    }

    // Auto-save on document update
    const updateHandler = () => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        persistState(doc);
      }, 2500);
    };

    doc.on("update", updateHandler);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save before tearing down
      persistState(doc);

      doc.off("update", updateHandler);
      if (wsProvider) {
        wsProvider.destroy();
      }
      doc.destroy();
      setYdoc(null);
      setProvider(null);
    };
  }, [documentId, initialBase64State, initialTextContent, currentUser, persistState]);

  return {
    ydoc,
    provider,
    collaborators,
    saveStatus,
    connectionStatus,
    persistNow: () => ydocRef.current && persistState(ydocRef.current),
  };
}

