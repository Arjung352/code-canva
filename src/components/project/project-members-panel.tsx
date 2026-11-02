"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, UserPlus, UserMinus, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { ProjectRole } from "@/lib/permissions";
import { hasProjectPermission } from "@/lib/permissions";

interface ProjectMember {
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

interface ProjectMembersPanelProps {
  projectId: string;
  currentUserRole: ProjectRole;
}

const ROLE_OPTIONS: ProjectRole[] = [
  "PROJECT_LEAD",
  "DEVELOPER",
  "REVIEWER",
  "VIEWER",
];

function roleLabel(role: ProjectRole): string {
  return role.replace("_", " ");
}

export function ProjectMembersPanel({
  projectId,
  currentUserRole,
}: ProjectMembersPanelProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<ProjectRole>("DEVELOPER");
  const [isAdding, setIsAdding] = useState(false);

  const canManage = hasProjectPermission(currentUserRole, "MANAGE_MEMBERS");

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (!res.ok) throw new Error("Failed to load members");
      const data = (await res.json()) as ProjectMember[];
      setMembers(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project members.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async () => {
    if (!addUserId.trim()) {
      toast({ variant: "destructive", title: "User ID is required" });
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: addUserId.trim(), role: addRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Failed to add member",
          description: json.error,
        });
        return;
      }
      toast({ title: "Member added" });
      setAddUserId("");
      await fetchMembers();
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: ProjectRole) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Failed to update role",
          description: json.error,
        });
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
      toast({ title: "Role updated" });
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Failed to remove member",
          description: json.error,
        });
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast({ title: "Member removed" });
    } catch {
      toast({ variant: "destructive", title: "Network error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-4 rounded-lg border p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                {member.user.avatarUrl && (
                  <AvatarImage src={member.user.avatarUrl} alt={member.user.username} />
                )}
                <AvatarFallback>
                  {member.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{member.user.username}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canManage ? (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(val) =>
                      handleRoleChange(member.id, val as ProjectRole)
                    }
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {roleLabel(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove member"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Shield className="h-3 w-3" />
                  {roleLabel(member.role)}
                </Badge>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No members yet.
          </p>
        )}
      </div>

      {canManage && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="User ID"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="flex-1 text-sm"
              />
              <Select
                value={addRole}
                onValueChange={(val) => setAddRole(val as ProjectRole)}
              >
                <SelectTrigger className="w-36 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={isAdding}
                size="sm"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

