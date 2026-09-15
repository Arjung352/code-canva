"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TailSpin } from "react-loader-spinner";
import { ArrowRight, Code2, Users } from "lucide-react";

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
        .replace(/[^a-z0-9-]/g, ""),
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

  if (loading) {
    return (
      <div className=" z-0 w-full h-screen flex justify-center items-center">
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
    <div className="relative mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      {/* Background glow */}
      <div
        className="
      pointer-events-none absolute
      -top-20 left-1/2
      h-64 w-64
      -translate-x-1/2
      rounded-full
      bg-blue-500/10
      blur-3xl
      dark:bg-blue-600/15
    "
      />

      {/* Card */}
      <div
        className="
      relative overflow-hidden
      rounded-2xl
      border border-slate-200
      bg-white/80
      p-6 shadow-xl
      backdrop-blur-xl
      sm:p-8

      dark:border-slate-700/70
      dark:bg-slate-950/70
      dark:shadow-2xl
    "
      >
        {/* Top icon */}
        <div
          className="
        mb-6 flex h-12 w-12 items-center justify-center
        rounded-xl
        border border-blue-200
        bg-blue-50
        text-blue-600

        dark:border-blue-500/20
        dark:bg-blue-500/10
        dark:text-blue-400
      "
        >
          <Code2 className="h-6 w-6" />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="
          text-2xl font-bold tracking-tight
          text-slate-900
          sm:text-3xl

          dark:text-white
        "
          >
            Create your team
          </h1>

          <p
            className="
          mt-2 text-sm leading-6
          text-slate-500
          sm:text-base

          dark:text-slate-400
        "
          >
            Bring developers together and build something amazing.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Error */}
          {error && (
            <div
              className="
            rounded-lg
            border border-red-200
            bg-red-50
            px-4 py-3
            text-sm text-red-600

            dark:border-red-500/20
            dark:bg-red-500/10
            dark:text-red-400
          "
            >
              {error}
            </div>
          )}

          {/* Team Name */}
          <div>
            <label
              className="
            mb-2 block text-sm font-medium
            text-slate-800
            dark:text-slate-200
          "
            >
              Team Name
            </label>

            <div className="relative">
              <Users
                className="
              pointer-events-none absolute
              left-4 top-1/2
              h-5 w-5
              -translate-y-1/2
              text-slate-400
              dark:text-slate-500
            "
              />

              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Dev Squad"
                className="
              h-12 w-full rounded-lg
              border border-slate-200
              bg-slate-50
              pl-12 pr-4
              text-sm text-slate-900
              outline-none
              transition-all

              placeholder:text-slate-400

              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20

              dark:border-slate-700
              dark:bg-slate-900/80
              dark:text-white
              dark:placeholder:text-slate-500
              dark:focus:border-blue-500
            "
              />
            </div>
          </div>

          {/* Team URL */}
          <div>
            <label
              className="
            mb-2 block text-sm font-medium
            text-slate-800
            dark:text-slate-200
          "
            >
              Team URL
            </label>

            <div
              className="
            flex h-12 overflow-hidden
            rounded-lg
            border border-slate-200
            bg-slate-50

            dark:border-slate-700
            dark:bg-slate-900/80
          "
            >
              {/* URL prefix */}
              <div
                className="
              flex shrink-0 items-center
              border-r border-slate-200
              bg-slate-100
              px-3
              text-sm text-slate-500

              dark:border-slate-700
              dark:bg-slate-800/70
              dark:text-slate-400
            "
              >
                /teams/
              </div>

              {/* Slug */}
              <input
                value={slug}
                readOnly
                className="
              min-w-0 flex-1
              bg-transparent
              px-4
              text-sm
              text-slate-700
              outline-none

              dark:text-slate-300
            "
              />
            </div>

            <p
              className="
            mt-2 text-xs
            text-slate-400
            dark:text-slate-500
          "
            >
              This will be used as your team&apos;s unique URL.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
          flex h-12 w-full
          items-center justify-center
          gap-2
          rounded-lg
          bg-blue-600
          px-5
          font-medium
          text-white
          transition-all duration-200

          hover:bg-blue-500
          hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]

          disabled:cursor-not-allowed
          disabled:opacity-50
        "
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                Create Team
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Bottom hint */}
        <div
          className="
        mt-7 flex items-center gap-3
        text-xs text-slate-400
        dark:text-slate-500
      "
        >
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />

          <span className="shrink-0">
            You can invite members after creating your team.
          </span>

          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
