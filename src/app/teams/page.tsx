"use client";

import Link from "next/link";

const mockTeams = [
  { id: 1, name: "Dev Squad", role: "Owner" },
  { id: 2, name: "Frontend Team", role: "Member" },
];

export default function TeamsPage() {
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

      {/* Teams Grid */}
      {mockTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTeams.map((team) => (
            <div
              key={team.id}
              className="p-5 rounded-xl border shadow-sm hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg">{team.name}</h2>
              <p className="text-sm text-muted-foreground">{team.role}</p>

              <button className="mt-4 text-sm text-primary">
                Open Team →
              </button>
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