"use client";

import { useState } from "react";

export default function CreateTeamPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // auto generate slug
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, "-"));
  };

  const handleSubmit = async () => {
    if (!name) return alert("Team name required");

    console.log({ name, slug });

    // TODO: API call
    // await fetch("/api/teams", { method: "POST", body: JSON.stringify({ name, slug }) });
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create a Team</h1>

      <div className="space-y-4">
        {/* Team Name */}
        <div>
          <label className="text-sm">Team Name</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg"
            placeholder="e.g. Dev Squad"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm">Team URL</label>
          <input
            value={slug}
            readOnly
            className="w-full mt-1 p-2 border rounded-lg bg-muted"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-white py-2 rounded-lg"
        >
          Create Team
        </button>
      </div>
    </div>
  );
}