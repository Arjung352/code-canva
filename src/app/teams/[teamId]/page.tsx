"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    username: string;
    email: string;
  };
}

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/teams/${teamId}/members`);
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (teamId) fetchMembers();
  }, [teamId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteStatus("");

    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteStatus(`Error: ${data.error}`);
      } else {
        setInviteStatus("Invite sent successfully!");
        setInviteEmail("");
      }
    } catch {
      setInviteStatus("Network error");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading team...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/teams" className="text-sm text-muted-foreground hover:underline">
          ← Back to Teams
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Team Members</h1>

      {/* Members List */}
      <div className="space-y-3 mb-10">
        {members.length === 0 ? (
          <p className="text-muted-foreground">No members found.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-4 border rounded-xl"
            >
              <div>
                <p className="font-medium">{m.user?.username ?? m.userId}</p>
                <p className="text-sm text-muted-foreground">{m.user?.email}</p>
              </div>
              <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-full">
                {m.role}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Invite Section */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Invite a Member</h2>

        <div className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleInvite}
            disabled={inviting}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </div>

        {inviteStatus && (
          <p
            className={`mt-2 text-sm ${
              inviteStatus.startsWith("Error") ? "text-red-500" : "text-green-600"
            }`}
          >
            {inviteStatus}
          </p>
        )}
      </div>
    </div>
  );
}
