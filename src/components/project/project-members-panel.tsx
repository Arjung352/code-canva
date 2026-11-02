"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  UserPlus,
  UserMinus,
  Shield,
  Check,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface EligibleTeamMember {
  id: string;
  userId: string;
  role: string; // Team role
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
  /** Clerk userId of the currently authenticated user — used to disable self-role-change */
  currentUserId?: string | null;
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
  currentUserId,
}: ProjectMembersPanelProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [eligibleMembers, setEligibleMembers] = useState<EligibleTeamMember[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<ProjectRole>("DEVELOPER");
  const [isAdding, setIsAdding] = useState(false);

  const canManage = hasProjectPermission(currentUserRole, "MANAGE_MEMBERS");

  // Fetch current project members
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

  // Fetch eligible team members (team members who are NOT yet in this project)
  const fetchEligibleMembers = useCallback(async () => {
    if (!canManage) return;
    setIsLoadingEligible(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/eligible-members`);
      if (!res.ok) throw new Error("Failed to load eligible team members");
      const data = (await res.json()) as EligibleTeamMember[];
      setEligibleMembers(data);
    } catch {
      console.error("Could not fetch eligible team members");
    } finally {
      setIsLoadingEligible(false);
    }
  }, [projectId, canManage]);

  useEffect(() => {
    fetchMembers();
    if (canManage) {
      fetchEligibleMembers();
    }
  }, [fetchMembers, fetchEligibleMembers, canManage]);

  const handleAddMember = async () => {
    if (!addUserId) {
      toast({ variant: "destructive", title: "Please select a team member" });
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: addUserId, role: addRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Failed to add member",
          description: json.error || "An error occurred",
        });
        return;
      }
      toast({ title: "Member added to project" });
      setAddUserId("");
      await Promise.all([fetchMembers(), fetchEligibleMembers()]);
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
      toast({ title: "Member removed from project" });
      // Refresh eligible list so the removed member can be re-added if desired
      fetchEligibleMembers();
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
            className="flex items-center justify-between gap-4 rounded-lg border p-3 bg-card"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                {member.user.avatarUrl && (
                  <AvatarImage
                    src={member.user.avatarUrl}
                    alt={member.user.username}
                  />
                )}
                <AvatarFallback>
                  {member.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canManage ? (
                <>
                  {currentUserId && member.userId === currentUserId ? (
                    // Own row — show role as badge only; cannot change own role
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Shield className="h-3 w-3" />
                      {roleLabel(member.role)}
                      <span className="text-[10px] text-muted-foreground ml-1">(you)</span>
                    </Badge>
                  ) : (
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
                  )}
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
            No members in this project yet.
          </p>
        )}
      </div>

      {canManage && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Add Team Member to Project
              </h3>
              <span className="text-xs text-muted-foreground">
                {eligibleMembers.length} eligible team{" "}
                {eligibleMembers.length === 1 ? "member" : "members"}
              </span>
            </div>

            {eligibleMembers.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Eligible Member Selector */}
                <Select value={addUserId} onValueChange={setAddUserId}>
                  <SelectTrigger className="flex-1 text-xs h-9">
                    <SelectValue
                      placeholder={
                        isLoadingEligible
                          ? "Loading team members..."
                          : "Select a team member..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleMembers.map((em) => (
                      <SelectItem
                        key={em.userId}
                        value={em.userId}
                        className="text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            {em.user.avatarUrl && (
                              <AvatarImage
                                src={em.user.avatarUrl}
                                alt={em.user.username}
                              />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {em.user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {em.user.username}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            ({em.user.email})
                          </span>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded ml-auto">
                            Team {em.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Project Role Selector */}
                <Select
                  value={addRole}
                  onValueChange={(val) => setAddRole(val as ProjectRole)}
                >
                  <SelectTrigger className="w-full sm:w-36 text-xs h-9">
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

                {/* Add Button */}
                <Button
                  onClick={handleAddMember}
                  disabled={isAdding || !addUserId}
                  size="sm"
                  className="h-9 px-4 text-xs shrink-0"
                >
                  {isAdding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-3 border rounded-lg bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  All members of this team have already been added to this
                  project.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
