"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTeamPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // auto generate slug
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!name) {
      setError("Team name is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // 🚀 Redirect to team page
      router.push(`/teams/${data.id}`);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create a Team</h1>

      <div className="space-y-4">
        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

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
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Team"}
        </button>
      </div>
    </div>
  );
}