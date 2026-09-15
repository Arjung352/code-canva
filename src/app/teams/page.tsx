"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  ArrowRight,
  Code2,
  Users,
  Folder,
  Trash,
} from "lucide-react";

export default function TeamsPage() {
  const { user } = useUser();
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
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <TailSpin
          height="80"
          width="80"
          color="#3f66dd"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-7">
        <div>
          <h1 className="text-3xl font-bold">
            Your <span className="text-primary">Teams</span>
          </h1>
          <p className="text-muted-foreground">
            Collaborate with your teams, projects, and codebases.
          </p>
          <p className="text-muted-foreground">
            Build something amazing things together.
          </p>
        </div>

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
          <h2 className="text-lg font-semibold mb-3">Pending Invitations</h2>

          <div className="space-y-3">
            {invites.map((invite: any) => (
              <div
                key={invite.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{invite.team.name}</p>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {teams.map((t: any) => (
            <div
              key={t.team.id}
              className="
          group relative overflow-hidden rounded-2xl
          border border-slate-200
          bg-white/80
          p-6
          shadow-sm
          backdrop-blur-sm
          transition-all duration-300
          hover:border-blue-400
          hover:shadow-[0_0_30px_rgba(59,130,246,0.10)]

          dark:border-slate-700/70
          dark:bg-slate-950/70
          dark:hover:border-blue-500/60
          dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]
        "
            >
              {/* Delete button */}
              {user && user.id === t.team.ownerId && (
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this team?")) {
                      const res = await fetch("/api/teams", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          teamId: t.team.id,
                        }),
                      });

                      if (res.ok) {
                        window.location.reload();
                      }
                    }
                  }}
                  className="
              absolute right-5 top-5
              rounded-md p-2
              text-slate-400
              transition-colors
              hover:bg-red-50
              hover:text-red-500

              dark:text-slate-500
              dark:hover:bg-red-500/10
              dark:hover:text-red-400
            "
                  title="Delete team"
                >
                  <Trash className="h-4 w-4" />
                </button>
              )}

              {/* Team Icon */}
              <div
                className="
            mb-5 flex h-14 w-14 items-center justify-center
            rounded-xl
            border border-blue-200
            bg-blue-50
            text-blue-500

            dark:border-blue-500/20
            dark:bg-blue-500/10
            dark:text-blue-400
          "
              >
                <Code2 className="h-7 w-7" />
              </div>

              {/* Team Info */}
              <div className="pr-10">
                <h2
                  className="
              mb-1 text-xl font-semibold
              text-slate-900
              dark:text-white
            "
                >
                  {t.team.name}
                </h2>

                <p
                  className="
              mb-5 text-sm
              text-slate-500
              dark:text-slate-400
            "
                >
                  {t.role}
                </p>
              </div>

              {/* Team Details */}
              <div
                className="
            mb-5 flex items-center gap-6
            text-sm
            text-slate-500
            dark:text-slate-400
          "
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Team member</span>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Projects</span>
                </div>
              </div>

              {/* Open Team */}
              <Link
                href={`/teams/${t.team.id}`}
                className="
            flex w-full items-center justify-center
            rounded-lg
            border border-blue-500/60
            bg-blue-50
            py-2.5
            text-sm font-medium
            text-blue-600
            transition-all duration-200
            hover:bg-blue-100
            hover:text-blue-700

            dark:bg-blue-500/5
            dark:text-blue-400
            dark:hover:bg-blue-500/10
            dark:hover:text-blue-300
          "
              >
                Open Team →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center my-20">
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
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2.5fr_1fr]">
        {/* Recent Activity */}
        <div
          className="
        rounded-2xl
        border border-slate-200
        bg-white/80
        p-6
        shadow-sm
        backdrop-blur-sm

        dark:border-slate-700/70
        dark:bg-slate-950/70
      "
        >
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              border border-blue-200
              bg-blue-50
              text-blue-500

              dark:border-blue-500/20
              dark:bg-blue-600/20
              dark:text-blue-400
            "
              >
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <h2
                  className="
                text-lg font-semibold
                text-slate-900
                dark:text-white
              "
                >
                  Recent Activity
                </h2>

                <p
                  className="
                text-sm
                text-slate-500
                dark:text-slate-400
              "
                >
                  Stay updated with what&apos;s happening in your teams.
                </p>
              </div>
            </div>

            <button
              className="
            flex items-center gap-1
            text-sm font-medium
            text-blue-600
            transition-colors
            hover:text-blue-700

            dark:text-blue-400
            dark:hover:text-blue-300
          "
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Empty State */}
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <div
              className="
            mb-3 flex h-12 w-12 items-center justify-center
            rounded-full
            bg-slate-100
            text-slate-400

            dark:bg-slate-800/70
            dark:text-slate-500
          "
            >
              <Activity className="h-5 w-5" />
            </div>

            <h3
              className="
            text-sm font-medium
            text-slate-700
            dark:text-slate-300
          "
            >
              No recent activity
            </h3>

            <p
              className="
            mt-1 max-w-sm text-sm
            text-slate-400
            dark:text-slate-500
          "
            >
              Team activity will appear here as you collaborate on projects.
            </p>
          </div>
        </div>

        {/* Create Team Card */}
        <div
          className="
        relative overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white/80
        p-6
        shadow-sm
        backdrop-blur-sm

        dark:border-slate-700/70
        dark:bg-slate-950/70
      "
        >
          {/* Background glow */}
          <div
            className="
          pointer-events-none absolute
          -right-10 -top-10
          h-32 w-32
          rounded-full
          bg-blue-500/10
          blur-3xl

          dark:bg-blue-600/10
        "
          />

          <div className="relative z-10">
            {/* Label */}
            <div className="mb-4 flex items-center gap-2">
              <span
                className="
              font-mono text-sm
              text-indigo-500
              dark:text-indigo-400
            "
              >
                //
              </span>

              <span
                className="
              text-sm font-medium
              text-indigo-600
              dark:text-indigo-400
            "
              >
                Better together
              </span>
            </div>

            {/* Icon */}
            <div
              className="
            absolute right-0 top-2
            text-blue-500
            dark:text-blue-500
          "
            >
              <Users className="h-16 w-16 stroke-[1.4]" />
            </div>

            {/* Heading */}
            <h2
              className="
            max-w-[220px]
            text-xl font-bold leading-tight
            text-slate-900

            dark:text-white
          "
            >
              Build. Collaborate.
              <br />
              Create.
            </h2>

            {/* Description */}
            <p
              className="
            mt-4 max-w-[260px]
            text-sm leading-6
            text-slate-500

            dark:text-slate-400
          "
            >
              Create a team, invite developers, and ship amazing projects.
            </p>

            {/* Button */}
            <Link
              href="/teams/create"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] text-lg"
            >
              <span className="text-base">+</span>
              Create a Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
