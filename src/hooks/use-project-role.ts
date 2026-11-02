"use client";

/**
 * useProjectRole
 *
 * Fetches and caches the current user's role within a given project.
 * Use this hook in UI components to conditionally render actions.
 * Always enforce the same permission checks on the server.
 */

import { useEffect, useState } from "react";
import type { ProjectRole } from "@/lib/permissions";

interface UseProjectRoleResult {
  role: ProjectRole | null;
  isLoading: boolean;
  error: string | null;
}

export function useProjectRole(projectId: string | null): UseProjectRoleResult {
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/projects/${projectId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch project role");
        const data = (await res.json()) as { myRole: ProjectRole };
        if (!cancelled) setRole(data.myRole);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return { role, isLoading, error };
}

