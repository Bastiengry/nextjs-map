"use client";

import { Project, ProjectIdLabel } from "@/app/_private/types/Project";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

export function useGetProject(
  queryClient: QueryClient,
  id: number | null | undefined
) {
  return useQuery<Project>(
    {
      queryKey: ["project", id],
      queryFn: async () => {
        if (id) {
          const res = await fetch(`/api/projects/${id}`);
          if (!res.ok) throw new Error("Erreur API");
          return res.json();
        } else {
          return null;
        }
      },
    },
    queryClient
  );
}

export function useProjectIdLabelQuery() {
  return useQuery<ProjectIdLabel[]>({
    queryKey: ["projectIdLabels"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/idLabels`);
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
  });
}

export function usePostProject(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async (project: Project) => {
      const res = await fetch(`/api/projects`, {
        method: "POST",
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: (project: Project) => {
      queryClient?.invalidateQueries({ queryKey: ["projectIdLabels"] });
    },
  });
}

export function usePutProject(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async (project: Project) => {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: (project: Project) => {
      queryClient.setQueryData(["project", project.id], project);
      queryClient.invalidateQueries({ queryKey: ["projectIdLabels"] });
    },
  });
}

export function useDeleteProject(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: ({ id }: { id: number }) => {
      queryClient?.invalidateQueries({ queryKey: ["project", id] });
      queryClient?.invalidateQueries({ queryKey: ["projectIdLabels"] });
    },
  });
}
