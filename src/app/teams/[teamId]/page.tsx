"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TailSpin } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { Shield, UserPlus, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/teams/${teamId}/members`);
        const data = await res.json();
        if (data.members) {
          setMembers(data.members);
          setCurrentRole(data.currentRole ?? null);
        } else if (Array.isArray(data)) {
          setMembers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (teamId) fetchMembers();
  }, [teamId]);

  const canInvite = currentRole === "OWNER" || currentRole === "ADMIN";

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter a valid email address");
      return;
    }
    setInviting(true);
    setInviteStatus("");

    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteStatus(`Error: ${data.error}`);
        toast.error(data.error || "Failed to send invitation");
      } else {
        setInviteStatus("Invite sent successfully!");
        toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
        setInviteEmail("");
        setInviteRole("MEMBER");
      }
    } catch {
      setInviteStatus("Network error");
      toast.error("Network error");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="z-0 w-full h-screen flex justify-center items-center">
        <TailSpin
          height="80"
          width="80"
          color="#3f66dd"
          ariaLabel="tail-spin-loading"
          radius="1"
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/teams"
          className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          {currentRole && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Your Role: <span className="font-semibold text-foreground">{currentRole}</span>
            </p>
          )}
        </div>
        <Link
          href={`/teams/${teamId}/projects`}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
        >
          View Projects →
        </Link>
      </div>

      {/* Members List */}
      <div className="space-y-3 mb-10">
        {members.length === 0 ? (
          <p className="text-muted-foreground">No members found.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-4 border rounded-xl bg-card"
            >
              <div>
                <p className="font-medium">{m.user?.username ?? m.userId}</p>
                <p className="text-sm text-muted-foreground">{m.user?.email}</p>
              </div>
              <span className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-full border">
                {m.role}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Invite Section (Only visible to OWNER and ADMIN) */}
      {canInvite && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Invite a Member</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Invite a colleague to this team. You can assign them an ADMIN or MEMBER role.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 p-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            <Select
              value={inviteRole}
              onValueChange={(val) => setInviteRole(val as "ADMIN" | "MEMBER")}
            >
              <SelectTrigger className="w-full sm:w-[130px] h-10 text-sm">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={handleInvite}
              disabled={inviting}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-primary/90 transition shrink-0"
            >
              {inviting ? "Inviting..." : "Send Invite"}
            </button>
          </div>

          {inviteStatus && (
            <p
              className={`mt-2 text-sm ${
                inviteStatus.startsWith("Error")
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {inviteStatus}
            </p>
          )}
        </div>
      )}

      <Toaster />
    </div>
  );
}
