"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTeams();
  }, []);

  // 🔹 Fetch Invites
  useEffect(() => {
    async function fetchInvites() {
      try {
        const res = await fetch("/api/invites");
        const data = await res.json();
        setInvites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvites();
  }, []);

  // 🔹 Accept Invite
  const acceptInvite = async (inviteId: string) => {
    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteId }),
    });

    if (res.ok) {
      // refresh page data
      window.location.reload();
    }
  };

  // 🔹 Loading UI
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Teams</h1>

        <Link
          href="/teams/create"
          className="px-4 py-2 rounded-lg bg-primary text-white"
        >
          + Create Team
        </Link>
      </div>

      {/* 🔥 Pending Invites Section */}
      {invites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            Pending Invitations
          </h2>

          <div className="space-y-3">
            {invites.map((invite: any) => (
              <div
                key={invite.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {invite.team.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Invited as {invite.role}
                  </p>
                </div>

                <button
                  onClick={() => acceptInvite(invite.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map((t: any) => (
            <div
              key={t.team.id}
              className="p-5 rounded-xl border shadow-sm hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg">
                {t.team.name}
              </h2>

              <p className="text-sm text-muted-foreground">
                {t.role}
              </p>

              <Link
                href={`/teams/${t.team.id}`}
                className="mt-4 inline-block text-sm text-primary"
              >
                Open Team →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20">
          <p className="text-muted-foreground mb-4">
            You are not part of any team yet
          </p>

          <Link
            href="/teams/create"
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Create your first team
          </Link>
        </div>
      )}
    </div>
  );
}