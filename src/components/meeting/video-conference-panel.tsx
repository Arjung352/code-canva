"use client";

import { useEffect, useState, useCallback } from "react";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import {
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
  PhoneOff,
  Shield,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { ProjectRole } from "@/lib/permissions";

interface VideoConferencePanelProps {
  projectId: string;
  meetingId: string;
  currentUserRole: ProjectRole | null;
  onClose: () => void;
  isHost?: boolean;
}

interface TokenResponse {
  token: string;
  serverUrl: string;
  roomName: string;
  meetingId: string;
  title: string;
  canPublish: boolean;
}

export function VideoConferencePanel({
  projectId,
  meetingId,
  currentUserRole,
  onClose,
  isHost = false,
}: VideoConferencePanelProps) {
  const { toast } = useToast();
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/meetings/${meetingId}/token`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join video room");
      }
      setTokenData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Video Room Error",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, meetingId, toast]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleEndMeetingForAll = async () => {
    try {
      await fetch(`/api/projects/${projectId}/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
      toast({ title: "Meeting ended for all participants" });
      onClose();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end meeting",
      });
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border bg-card/95 backdrop-blur shadow-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Connecting to Video Conference...</p>
        <p className="text-xs text-muted-foreground">
          Securing your LiveKit session
        </p>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border bg-card/95 backdrop-blur shadow-2xl p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <VideoOff className="h-5 w-5" />
          <h4 className="font-semibold text-sm">Could Not Connect</h4>
        </div>
        <p className="text-xs text-muted-foreground">{error || "Unknown error"}</p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={fetchToken}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isLead = currentUserRole === "PROJECT_LEAD" || isHost;

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 transition-all duration-200 rounded-2xl border bg-card/95 backdrop-blur shadow-2xl overflow-hidden flex flex-col ${
        isMinimized
          ? "w-80 h-14"
          : "w-[440px] sm:w-[540px] md:w-[620px] h-[480px]"
      }`}
    >
      {/* Meeting Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-semibold truncate">
            {tokenData.title || "Project Video Meeting"}
          </span>
          {!tokenData.canPublish && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 gap-1">
              <Shield className="h-2.5 w-2.5" /> Viewer
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </Button>

          {isLead && !isMinimized && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={handleEndMeetingForAll}
              title="End meeting for all participants"
            >
              End for all
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs px-2.5 gap-1"
            onClick={onClose}
            title="Leave meeting (does not interrupt code editing)"
          >
            <PhoneOff className="h-3 w-3" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Conference Room */}
      {!isMinimized && (
        <div className="flex-1 min-h-0 relative bg-black/90">
          <LiveKitRoom
            video={tokenData.canPublish}
            audio={tokenData.canPublish}
            token={tokenData.token}
            serverUrl={tokenData.serverUrl}
            onDisconnected={onClose}
            data-lk-theme="default"
            className="h-full w-full"
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      )}
    </div>
  );
}

